import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class RAGSystem:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Gemini API Key is required for RAGSystem")
            
        print("DEBUG: Initializing RAG with text-embedding-004...")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004", 
            google_api_key=api_key
        )
        self.vector_store = Chroma(
            persist_directory="./chroma_db", 
            embedding_function=self.embeddings
        )
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    def add_text(self, text: str):
        if not text or len(text.strip()) < 5:
            return
        docs = [Document(page_content=text)]
        chunks = self.text_splitter.split_documents(docs)
        self.vector_store.add_documents(chunks)
        print(f"DEBUG: Added {len(chunks)} chunks to RAG.")

    def get_context(self, query: str):
        if not query or len(query.strip()) < 3:
            return ""
            
        print(f"DEBUG: RAG searching for: {query}")
        
        # 1. Similarity Search
        try:
            results = self.vector_store.similarity_search(query, k=5)
            context = "\n\n".join([doc.page_content for doc in results])
            
            if context.strip():
                print(f"DEBUG: RAG found {len(results)} matches.")
                return context
        except Exception as e:
            print(f"DEBUG: RAG Search error: {e}")
            
        # 2. Fallback: If no match, try keywords? (Optional if vector fails)
        return ""

    def add_file(self, file_path: str):
        """Extracts text from a file and adds it to the vector store."""
        from pypdf import PdfReader
        
        text = ""
        ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if ext == ".pdf":
                reader = PdfReader(file_path)
                for page in reader.pages:
                    content = page.extract_text()
                    if content:
                        text += content + "\n"
            elif ext in [".txt", ".md", ".json"]:
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
            
            if text:
                self.add_text(text)
                return True
        except Exception as e:
            print(f"DEBUG: Error processing file for RAG: {e}")
            
        return False
