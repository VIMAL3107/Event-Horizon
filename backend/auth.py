import sqlite3
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Body
from pydantic import BaseModel, EmailStr

router = APIRouter()

# --- Database Initialization ---
def init_auth_db():
    conn = sqlite3.connect("chatbot.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id TEXT PRIMARY KEY, username TEXT, email TEXT UNIQUE, password TEXT, created_at TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS user_sessions
                 (session_token TEXT PRIMARY KEY, user_id TEXT, created_at TIMESTAMP)''')
    conn.commit()
    conn.close()

init_auth_db()

# --- Models ---
class RegisterModel(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginModel(BaseModel):
    email: EmailStr
    password: str

# --- Endpoints ---

@router.post("/auth/register")
async def register(data: RegisterModel):
    conn = sqlite3.connect("chatbot.db")
    c = conn.cursor()
    try:
        user_id = str(uuid.uuid4())
        c.execute("INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)",
                  (user_id, data.username, data.email, data.password, datetime.now()))
        conn.commit()
        return {"message": "User registered successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists")
    finally:
        conn.close()

@router.post("/auth/login")
async def login(data: LoginModel):
    conn = sqlite3.connect("chatbot.db")
    c = conn.cursor()
    user = c.execute("SELECT id, username FROM users WHERE email = ? AND password = ?", 
                     (data.email, data.password)).fetchone()
    
    if not user:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id, username = user
    session_token = str(uuid.uuid4())
    c.execute("INSERT INTO user_sessions (session_token, user_id, created_at) VALUES (?, ?, ?)",
              (session_token, user_id, datetime.now()))
    conn.commit()
    conn.close()
    
    return {
        "token": session_token,
        "user": {
            "id": user_id,
            "username": username,
            "email": data.email
        }
    }

@router.get("/auth/status")
async def auth_status(request: Request):
    # Check for session token in header
    token = request.headers.get("X-Session-Token")
    if not token:
        return {"connected": False}
    
    conn = sqlite3.connect("chatbot.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    session = c.execute("""
        SELECT u.id, u.username, u.email 
        FROM users u 
        JOIN user_sessions s ON u.id = s.user_id 
        WHERE s.session_token = ?
    """, (token,)).fetchone()
    conn.close()
    
    if session:
        return {
            "connected": True,
            "user": {
                "id": session["id"],
                "username": session["username"],
                "email": session["email"]
            }
        }
    return {"connected": False}

@router.post("/auth/logout")
async def logout(request: Request):
    token = request.headers.get("X-Session-Token")
    if token:
        conn = sqlite3.connect("chatbot.db")
        conn.execute("DELETE FROM user_sessions WHERE session_token = ?", (token,))
        conn.commit()
        conn.close()
    return {"message": "Logged out"}

