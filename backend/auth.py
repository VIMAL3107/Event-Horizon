import os
import json
import sqlite3
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Allow HTTP for local testing
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

@router.get("/auth/logout")
async def logout():
    conn = sqlite3.connect("chatbot.db")
    c = conn.cursor()
    c.execute("DELETE FROM user_tokens WHERE key = 'google_auth_token'")
    conn.commit()
    conn.close()
    return {"status": "logged_out"}

CLIENT_SECRET_FILE = os.path.join(os.path.dirname(__file__), 'client_secret.json')
SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile', 
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/gmail.readonly'
]

def get_flow(redirect_uri=None):
    if not os.path.exists(CLIENT_SECRET_FILE):
        return None
    
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri=redirect_uri
    )
    return flow

@router.get("/auth/login")
async def login(request: Request):
    # Determine base URL dynamically from request
    host = request.headers.get('host')
    proto = request.headers.get('x-forwarded-proto', 'http')
    redirect_uri = f"{proto}://{host}/auth/callback"
    
    flow = get_flow(redirect_uri=redirect_uri)
    if not flow:
        return {"error": "client_secret.json not found on server."}
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    return {"auth_url": authorization_url}

@router.get("/auth/callback")
async def callback(code: str, request: Request):
    host = request.headers.get('host')
    proto = request.headers.get('x-forwarded-proto', 'http')
    redirect_uri = f"{proto}://{host}/auth/callback"

    flow = get_flow(redirect_uri=redirect_uri)
    if not flow:
         raise HTTPException(status_code=500, detail="Configuration missing")
    
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    # Save credentials to DB
    creds_data = json.loads(credentials.to_json())
    
    conn = sqlite3.connect("chatbot.db")
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO user_tokens (key, value, updated_at) VALUES (?, ?, ?)", 
              ("google_auth_token", json.dumps(creds_data), datetime.now()))
    conn.commit()
    conn.close()
    
    # Return to frontend - relative to same host
    return RedirectResponse(url=f"{proto}://{host}?status=connected")

@router.get("/auth/status")
async def auth_status():
    conn = sqlite3.connect("chatbot.db")
    c = conn.cursor()
    row = c.execute("SELECT value FROM user_tokens WHERE key = 'google_auth_token'").fetchone()
    conn.close()
    
    if row:
        creds_data = json.loads(row[0])
        creds = Credentials.from_authorized_user_info(creds_data)
        
        # Verify if token is valid/refreshable
        if not creds.valid:
            if creds.expired and creds.refresh_token:
                try:
                    creds.refresh(GoogleRequest())
                    # Update DB with refreshed token
                    conn = sqlite3.connect("chatbot.db")
                    c = conn.cursor()
                    c.execute("INSERT OR REPLACE INTO user_tokens (key, value, updated_at) VALUES (?, ?, ?)", 
                              ("google_auth_token", creds.to_json(), datetime.now()))
                    conn.commit()
                    conn.close()
                except Exception as e:
                    print(f"Token refresh failed: {e}")
                    return {"connected": False, "message": "Session expired"}
            else:
                return {"connected": False, "message": "Invalid token"}
        
        # Fetch user info
        try:
            from googleapiclient.discovery import build
            service = build('oauth2', 'v2', credentials=creds)
            user_info = service.userinfo().get().execute()
            
            return {
                "connected": True, 
                "user": {
                    "name": user_info.get("name"),
                    "email": user_info.get("email"),
                    "avatar": user_info.get("picture"),
                    "provider": "google"
                }
            }
        except Exception as e:
            print(f"Failed to fetch user info: {e}")
            return {"connected": True, "message": "Connected but failed to fetch profile"}

    return {"connected": False, "message": "No user connected"}
