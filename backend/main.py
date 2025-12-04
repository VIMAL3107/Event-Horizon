import os
import json
import sqlite3
import uuid 
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Load env from backend directory first, then root
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)
load_dotenv() # Fallback to CWD

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Database Setup
DB_NAME = "chatbot.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS sessions
                 (id TEXT PRIMARY KEY, title TEXT, created_at TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS messages
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, role TEXT, content TEXT, type TEXT, created_at TIMESTAMP,
                  FOREIGN KEY(session_id) REFERENCES sessions(id))''')
    conn.commit()
    conn.close()

init_db()

# Models
class Session(BaseModel):
    id: str
    title: str
    created_at: datetime

class Message(BaseModel):
    role: str
    content: str
    type: str = "text" # text, image, file

class ChatRequest(BaseModel):
    messages: list[Message]
    model: str = "gemini-flash-latest"

SYSTEM_PROMPT = """
You are a helpful, knowledgeable, and versatile AI assistant.

**Your Goals:**
1.  **Be Helpful**: Answer the user's questions clearly, accurately, and concisely.
2.  **Be Versatile**: You can assist with coding, writing, analysis, creative tasks, and general knowledge.
3.  **Be Natural**: Communicate in a natural, conversational tone.
4.  **Be Safe**: Do not generate harmful, illegal, or biased content.

Adapt your response style to the user's request. If they ask for code, provide code. If they ask for a summary, provide a summary.
"""

# Helper functions
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/sessions")
async def get_sessions():
    conn = get_db_connection()
    sessions = conn.execute("SELECT * FROM sessions ORDER BY created_at DESC").fetchall()
    conn.close()
    return [{"id": s["id"], "title": s["title"], "created_at": s["created_at"]} for s in sessions]

@app.post("/sessions")
async def create_session(title: str = "New Chat"):
    session_id = str(uuid.uuid4())
    conn = get_db_connection()
    conn.execute("INSERT INTO sessions (id, title, created_at) VALUES (?, ?, ?)", 
                 (session_id, title, datetime.now()))
    conn.commit()
    conn.close()
    return {"id": session_id, "title": title}

@app.get("/sessions/{session_id}")
async def get_session_messages(session_id: str):
    conn = get_db_connection()
    messages = conn.execute("SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,)).fetchall()
    conn.close()
    return [{"role": m["role"], "content": m["content"], "type": m["type"]} for m in messages]

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    conn = get_db_connection()
    conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    conn.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/chat")
async def chat_endpoint(
    message: str = Form(...),
    session_id: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set on server")

    conn = get_db_connection()
    
    # Save user message
    msg_type = "text"
    if file:
        msg_type = "file" # Simplified for now
        # In a real app, we might save the file path or upload to cloud storage
        # Here we just store a placeholder in content for the DB
    
    conn.execute("INSERT INTO messages (session_id, role, content, type, created_at) VALUES (?, ?, ?, ?, ?)",
                 (session_id, "user", message, msg_type, datetime.now()))
    conn.commit()

    # Retrieve history for context
    history_rows = conn.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,)).fetchall()
    
    gemini_history = []
    # Add system prompt implicitly via system_instruction in model init
    
    for row in history_rows[:-1]: # Exclude the just added message to avoid duplication if we handle it specially
        role = "user" if row["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [row["content"]]})

    try:
        model = genai.GenerativeModel(
            model_name="gemini-flash-latest", # Use a model that supports multimodal
            system_instruction=SYSTEM_PROMPT
        )
        
        chat = model.start_chat(history=gemini_history)
        
        # Prepare content for generation
        content_parts = [message]
        
        if file:
            content_type = file.content_type
            file_data = await file.read()
            
            # Create a Part object for the file
            # Note: For large files, using the File API is better, but for small uploads this works
            blob = {"mime_type": content_type, "data": file_data}
            content_parts.append(blob)

        async def generate():
            full_response = ""
            response = await chat.send_message_async(content_parts, stream=True)
            async for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield chunk.text
            
            # Save AI response to DB after streaming
            conn.execute("INSERT INTO messages (session_id, role, content, type, created_at) VALUES (?, ?, ?, ?, ?)",
                         (session_id, "assistant", full_response, "text", datetime.now()))
            conn.commit()
            conn.close()

        return StreamingResponse(generate(), media_type="text/plain")

    except Exception as e:
        print(f"Gemini Error: {str(e)}")
        conn.close()
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
