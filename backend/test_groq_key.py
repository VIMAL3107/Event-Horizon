import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("Error: GROQ_API_KEY not found in .env file.")
    exit(1)

print(f"Testing Groq API Key: {api_key[:5]}...{api_key[-5:]}")

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
data = {
    "messages": [{"role": "user", "content": "Hello, is this working?"}],
    "model": "llama-3.1-8b-instant"
}

try:
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 200:
        print("Success! Groq API Key is working.")
        print("Response:", response.json()['choices'][0]['message']['content'])
    else:
        print(f"Failed. Status Code: {response.status_code}")
        print("Error:", response.text)
except Exception as e:
    print(f"An error occurred: {e}")
