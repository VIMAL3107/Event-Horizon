import sqlite3
import os

def check_setup():
    print("Checking setup...")
    
    # Check client_secret.json
    if os.path.exists("backend/client_secret.json"):
        print("[OK] backend/client_secret.json exists.")
    else:
        print("[WARNING] backend/client_secret.json MISSING. Google Login will fail.")

    # Check Database
    if os.path.exists("backend/chatbot.db"):
        print("[OK] chatbot.db exists.")
        try:
            conn = sqlite3.connect("backend/chatbot.db")
            c = conn.cursor()
            
            # Check user_tokens table
            c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_tokens'")
            if c.fetchone():
                print("[OK] Table 'user_tokens' exists.")
            else:
                print("[ERROR] Table 'user_tokens' DOES NOT exist.")
                
            conn.close()
        except Exception as e:
            print(f"[ERROR] Database check failed: {e}")
    else:
        print("[ERROR] chatbot.db MISSING.")

if __name__ == "__main__":
    check_setup()
