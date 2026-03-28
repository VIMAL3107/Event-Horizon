import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
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
        # Using FAISS for Python 3.14 compatibility (ChromaDB has Pydantic issues)
        self.index_path = "faiss_index"
        self.vector_store = None
        self._load_index()
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    def _load_index(self):
        """Loads the FAISS index from disk or creates a dummy initial one."""
        try:
            if os.path.exists(self.index_path):
                # allow_dangerous_deserialization is required for loading FAISS files
                self.vector_store = FAISS.load_local(
                    self.index_path, 
                    self.embeddings, 
                    allow_dangerous_deserialization=True
                )
                print("DEBUG: FAISS index loaded from disk.")
            else:
                # Initialize an empty vector store if none exists
                # We need at least one initial document to save an index
                print("DEBUG: No FAISS index found. Creating new...")
                pass # Will be created on first add_text
        except Exception as e:
            print(f"DEBUG: FAISS Load error: {e}")

    def add_text(self, text: str):
        if not text or len(text.strip()) < 5:
            return
        
        docs = [Document(page_content=text)]
        chunks = self.text_splitter.split_documents(docs)
        
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        else:
            self.vector_store.add_documents(chunks)
            
        # Persistence
        self.vector_store.save_local(self.index_path)
        print(f"DEBUG: Saved {len(chunks)} chunks to FAISS.")

    def get_context(self, query: str):
        if not query or len(query.strip()) < 3 or self.vector_store is None:
            return ""
            
        print(f"DEBUG: RAG searching for: {query}")
        
        try:
            results = self.vector_store.similarity_search(query, k=5)
            context = "\n\n".join([doc.page_content for doc in results])
            
            if context.strip():
                print(f"DEBUG: RAG found {len(results)} matches.")
                return context
        except Exception as e:
            print(f"DEBUG: RAG Search error: {e}")
            
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
