import os
from dotenv import load_dotenv
from backend.rag import RAGSystem

from pathlib import Path

env_path = Path(__file__).parent / 'backend' / '.env'
load_dotenv(dotenv_path=env_path)
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

try:
    rag = RAGSystem(api_key)
    print("RAG initialized.")
    
    test_text = "The secret password is 'COSMIC-HORIZON-2026'. Event Horizon is a futuristic chatbot project."
    print("Adding test text...")
    rag.add_text(test_text)
    
    print("Searching for 'secret password'...")
    context = rag.get_context("What is the secret password?")
    print(f"Context found: '{context}'")
    
    if "COSMIC-HORIZON-2026" in context:
        print("SUCCESS: RAG is working correctly.")
    else:
        print("FAILURE: RAG did not return the expected context.")

except Exception as e:
    print(f"Error during test: {e}")
