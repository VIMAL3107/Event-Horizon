import os
from dotenv import load_dotenv
from rag import RAGSystem

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found")
    exit(1)

try:
    rag = RAGSystem(api_key)
    print("RAG initialized")
    
    test_text = "The capital of France is Paris. Vimal Raj R is an AI Engineer who built Event Horizon."
    rag.add_text(test_text)
    print("Text added")
    
    context = rag.get_context("Who is Vimal Raj R?")
    print(f"Query: Who is Vimal Raj R?\nContext: {context}")
    
    if "Vimal Raj R" in context:
        print("SUCCESS: RAG is working for direct matches")
    else:
        print("FAILURE: RAG did not find the relevant text")

except Exception as e:
    print(f"An error occurred: {e}")
