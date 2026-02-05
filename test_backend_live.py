
import requests
import sys

BASE_URL = "http://localhost:8000"

def test_backend():
    print(f"Testing backend at {BASE_URL}")
    
    # 1. Create Session
    try:
        print("Creating session...")
        res = requests.post(f"{BASE_URL}/sessions", headers={"X-User-ID": "test_user"})
        print(f"Create Session Status: {res.status_code}")
        if res.status_code != 200:
            print(f"Error: {res.text}")
            return
        
        session_data = res.json()
        session_id = session_data["id"]
        print(f"Session Created: {session_id}")
    except Exception as e:
        print(f"Failed to create session: {e}")
        return

    # 2. Send Message
    try:
        print("Sending message...")
        payload = {"message": "Hello", "session_id": session_id}
        # Note: /chat expects Form data
        res = requests.post(f"{BASE_URL}/chat", data=payload, headers={"X-User-ID": "test_user"}, stream=True)
        print(f"Send Message Status: {res.status_code}")
        
        if res.status_code == 200:
            print("Response stream content:")
            for chunk in res.iter_content(chunk_size=1024):
                if chunk:
                    print(chunk.decode(), end="")
            print("\nMessage sent successfully.")
        else:
            print(f"Error: {res.text}")

    except Exception as e:
        print(f"Failed to send message: {e}")

    # 3. Delete Session
    try:
        print(f"Deleting session {session_id}...")
        res = requests.delete(f"{BASE_URL}/sessions/{session_id}", headers={"X-User-ID": "test_user"})
        print(f"Delete Session Status: {res.status_code}")
        if res.status_code == 200:
            print("Session deleted.")
        else:
            print(f"Error: {res.text}")
    except Exception as e:
        print(f"Failed to delete session: {e}")

if __name__ == "__main__":
    test_backend()
