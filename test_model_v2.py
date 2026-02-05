import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load key
load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in backend/.env")
    exit(1)

genai.configure(api_key=api_key)

print(f"Testing model: gemini-flash-lite-latest")

try:
    model = genai.GenerativeModel("gemini-flash-lite-latest")
    response = model.generate_content("Hello! Are you working?")
    print("-" * 30)
    print("Response from AI:")
    print(response.text)
    print("-" * 30)
    print("Test Successful!")
except Exception as e:
    print(f"Test Failed: {e}")
