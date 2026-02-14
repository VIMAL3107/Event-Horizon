import os
import sqlite3
import uuid
import json
import base64
import requests
import asyncio
from datetime import datetime
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# Local Imports
from rag import RAGSystem

# --- Configuration & Setup ---

# Load env from backend directory first, then root
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)
load_dotenv() # Fallback to CWD

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not set found in environment variables.")

# Initialize RAG System
rag_system = None
if GEMINI_API_KEY:
    try:
        rag_system = RAGSystem(GEMINI_API_KEY)
        print("RAG System initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize RAG System: {e}")

# Database Setup
DB_NAME = "chatbot.db"

def get_db_connection():
    # Increase timeout to 30 seconds to handle concurrent access better
    conn = sqlite3.connect(DB_NAME, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    # Enable Write-Ahead Logging (WAL) mode for better concurrency
    try:
        conn.execute("PRAGMA journal_mode=WAL")
    except Exception as e:
        print(f"Warning: Could not enable WAL mode: {e}")
        
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS sessions
                 (id TEXT PRIMARY KEY, title TEXT, created_at TIMESTAMP)''')
    
    # Check for user_id column and add if missing (Migration)
    try:
        c.execute("SELECT user_id FROM sessions LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating DB: Adding user_id column")
        c.execute("ALTER TABLE sessions ADD COLUMN user_id TEXT")

    c.execute('''CREATE TABLE IF NOT EXISTS messages
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, role TEXT, content TEXT, type TEXT, created_at TIMESTAMP,
                  FOREIGN KEY(session_id) REFERENCES sessions(id))''')
    conn.commit()
    conn.close()

init_db()

# --- Models ---

class Session(BaseModel):
    id: str
    title: str
    created_at: datetime
    user_id: Optional[str] = None

class Message(BaseModel):
    role: str
    content: str
    type: str = "text"

class ChatRequest(BaseModel):
    messages: list[Message]
    model: str = "gemini-1.5-flash"

SYSTEM_PROMPT = """
You are a helpful, knowledgeable, and versatile AI assistant.

**Your Goals:**
1.  **Be Helpful**: Answer the user's questions clearly, accurately, and concisely.
2.  **Be Versatile**: You can assist with coding, writing, analysis, creative tasks, and general knowledge.
3.  **Be Natural**: Communicate in a natural, conversational tone.
4.  **Be Safe**: Do not generate harmful, illegal, or biased content.

Adapt your response style to the user's request.
"""

# --- Helper Functions ---

async def generate_chat_title(session_id: str, user_message: str):
    """Generates a short title for the chat session based on the first message."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(f"Generate a short (3-5 words) title for this chat based on the user's message: {user_message}")
        new_title = response.text.strip()
        
        conn = get_db_connection()
        conn.execute("UPDATE sessions SET title = ? WHERE id = ?", (new_title, session_id))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error generating chat title: {e}")

# --- Endpoints ---

@app.get("/sessions")
async def get_sessions(x_user_id: Optional[str] = Header(None, alias="X-User-ID")):
    conn = get_db_connection()
    if x_user_id:
        sessions = conn.execute("SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC", (x_user_id,)).fetchall()
    else:
        # Fallback for old clients or if no ID sent: return nothing or public sessions
        # For privacy, better to return empty list if no ID provided in this new mode
        sessions = []
    conn.close()
    return [{"id": s["id"], "title": s["title"], "created_at": s["created_at"]} for s in sessions]

@app.post("/sessions")
async def create_session(title: str = "New Chat", x_user_id: Optional[str] = Header(None, alias="X-User-ID")):
    session_id = str(uuid.uuid4())
    conn = get_db_connection()
    # Save with user_id if present
    conn.execute("INSERT INTO sessions (id, title, created_at, user_id) VALUES (?, ?, ?, ?)", 
                 (session_id, title, datetime.now(), x_user_id))
    conn.commit()
    conn.close()
    return {"id": session_id, "title": title}

@app.get("/sessions/{session_id}")
async def get_session_messages(session_id: str, x_user_id: Optional[str] = Header(None, alias="X-User-ID")):
    conn = get_db_connection()
    # Verify ownership (optional but recommended)
    session = conn.execute("SELECT user_id FROM sessions WHERE id = ?", (session_id,)).fetchone()
    
    if session:
        # If session has an owner and it doesn't match request, deny access
        if session['user_id'] and session['user_id'] != x_user_id:
            conn.close()
            # Silent fail or 403
            return [] # Returning empty list to not leak existence, or could raise 403

    messages = conn.execute("SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,)).fetchall()
    conn.close()
    return [{"role": m["role"], "content": m["content"], "type": m["type"]} for m in messages]

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str, x_user_id: Optional[str] = Header(None, alias="X-User-ID")):
    conn = get_db_connection()
    # Verify ownership
    session = conn.execute("SELECT user_id FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if session and session['user_id'] and session['user_id'] != x_user_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")

    conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.patch("/sessions/{session_id}")
async def update_session_title(session_id: str, title: str = Body(..., embed=True), x_user_id: Optional[str] = Header(None, alias="X-User-ID")):
    conn = get_db_connection()
    # Verify ownership
    session = conn.execute("SELECT user_id FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if session and session['user_id'] and session['user_id'] != x_user_id:
        conn.close()
        raise HTTPException(status_code=403, detail="Not authorized to edit this session")

    conn.execute("UPDATE sessions SET title = ? WHERE id = ?", (title, session_id))
    conn.commit()
    conn.close()
    return {"status": "success", "id": session_id, "title": title}

@app.post("/add-knowledge")
async def add_knowledge(text: str = Form(...)):
    if not rag_system:
         raise HTTPException(status_code=500, detail="RAG System not initialized (check API Key).")
    try:
        rag_system.add_text(text)
        return {"status": "success", "message": "Knowledge added to brain."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-knowledge")
async def upload_knowledge(file: UploadFile = File(...)):
    if not rag_system:
         raise HTTPException(status_code=500, detail="RAG System not initialized.")
    
    try:
        # Save temp file
        temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Add to RAG
        rag_system.add_file(temp_filename)
        
        # Cleanup
        os.remove(temp_filename)
        
        return {"status": "success", "message": f"File '{file.filename}' processed and added to brain."}
    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_endpoint(
    message: str = Form(...),
    session_id: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set on server")

    conn = get_db_connection()
    
    # 1. Save User Message
    msg_type = "text"
    if file:
        msg_type = "file"
        
    conn.execute("INSERT INTO messages (session_id, role, content, type, created_at) VALUES (?, ?, ?, ?, ?)",
                 (session_id, "user", message, msg_type, datetime.now()))
    conn.commit()

    # 2. Check if we need to generate a title (if it's the start of a chat)
    message_count = conn.execute("SELECT COUNT(*) FROM messages WHERE session_id = ?", (session_id,)).fetchone()[0]
    if message_count <= 2: # User message + potentially 1 previous
        asyncio.create_task(generate_chat_title(session_id, message))

    # 3. Retrieve History for Context
    history_rows = conn.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,)).fetchall()
    
    gemini_history = []
    # Load history into Gemini format
    for row in history_rows[:-1]: # Exclude the just added message to avoid duplication in history vs new message
        role = "user" if row["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [row["content"]]})

    try:
        model = os.getenv("GROQ_API_KEY")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {model}",
            "Content-Type": "application/json"
        }
        data = {
            "messages": [{"role": "user", "content": message}],
            "model": "llama-3.1-8b-instant"
        }
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            print("Success! Groq API Key is working.")
            print("Response:", response.json()['choices'][0]['message']['content'])
            final_prompt = response.json()['choices'][0]['message']['content']
        else:
            print(f"Failed. Status Code: {response.status_code}")
            print("Error:", response.text)
        
        # 5. RAG Integration: Retrieve Context
        # We start with the user's raw message
        final_prompt = message
        
        if rag_system:
            try:
                context_data = rag_system.get_context(message)
                if context_data:
                    system_instruction_rag = f"""
                    You are an assistant. Use the provided Context to answer the user's question. 
                    If the answer is not in the context, just use your own knowledge.
                    
                    Context:
                    {context_data}
                    """
                    final_prompt = f"{system_instruction_rag}\n\nUser Question: {message}"
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                     print(f"RAG Warning: Gemini Embedding Quota Exceeded (Free Tier Limit). Proceeding without context.")
                else:
                    print(f"RAG Retrieval failed: {e}. Proceeding without context.")
                # We simply continue with the original 'message' as final_prompt
                pass

        # 6. Prepare Content Parts (handling file uploads if any)
        content_parts = [final_prompt]
        
        if file:
            content_type = file.content_type
            file_data = await file.read()
            blob = {"mime_type": content_type, "data": file_data}
            content_parts.append(blob)

        # 7. Generate Response (Streaming)
        async def generate():
            print("DEBUG: Starting generation...")
            full_response = ""
            try:
                print(f"DEBUG: sending message to gemini with parts: {len(content_parts)}")
                response = await chat.send_message_async(content_parts, stream=True)
                print("DEBUG: message sent, receiving chunks...")
                async for chunk in response:
                    if chunk.text:
                        full_response += chunk.text
                        yield chunk.text
            except Exception as e:
                print(f"DEBUG: Generation ERROR: {e}")
                yield f"[Error generating response: {str(e)}]"
                return

            # Save AI response to DB after streaming is complete
            try:
                print("DEBUG: Saving response to DB...")
                conn_new = get_db_connection()
                conn_new.execute("INSERT INTO messages (session_id, role, content, type, created_at) VALUES (?, ?, ?, ?, ?)",
                             (session_id, "assistant", full_response, "text", datetime.now()))
                conn_new.commit()
                conn_new.close()
                print("DEBUG: Response saved.")
            except Exception as e:
                print(f"DEBUG: DB Error in background: {e}")

            
        return StreamingResponse(generate(), media_type="text/plain")

    except Exception as e:
        conn.close()
        print(f"Gemini Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")
    finally:
        conn.close()

@app.post("/generate-image")
async def generate_image(prompt: str = Form(...)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")
    
    try:
        # We will use the REST API directly for Imagen
        url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key={GEMINI_API_KEY}"
        
        payload = {
            "instances": [{"prompt": prompt}],
            "parameters": {"sampleCount": 1}
        }
        
        response = requests.post(url, json=payload)
        
        if response.status_code != 200:
             # Fallback or detail error
             raise HTTPException(status_code=500, detail=f"Google API Error: {response.text}")
             
        result = response.json()
        if "predictions" not in result:
             raise HTTPException(status_code=500, detail="No image generated")
             
        b64_image = result["predictions"][0]["bytesBase64Encoded"]
        return {"image_url": f"data:image/png;base64,{b64_image}"}

    except Exception as e:
        print(f"Image Gen Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Frontend Static Files Serving ---

# Mount static files - serve the built React app
frontend_dist = Path(__file__).parent.parent / 'dist'

if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")

    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str):
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = frontend_dist / catchall
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    print(f"WARNING: Frontend dist directory not found at {frontend_dist}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
