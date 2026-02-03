import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class RAGSystem:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Gemini API Key is required for RAGSystem")
            
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001", 
            google_api_key=api_key
        )
        self.vector_store = Chroma(
            persist_directory="./chroma_db", 
            embedding_function=self.embeddings
        )
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    def add_text(self, text: str):
        if not text:
            return
        docs = [Document(page_content=text)]
        chunks = self.text_splitter.split_documents(docs)
        self.vector_store.add_documents(chunks)

    def get_context(self, query: str):
        if not query:
            return ""
        results = self.vector_store.similarity_search(query, k=3)
        return "\n\n".join([doc.page_content for doc in results])

    def add_file(self, file_path: str):
        """Extracts text from a file and adds it to the vector store."""
        import os
        from pypdf import PdfReader
        
        text = ""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == ".pdf":
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif ext in [".txt", ".md", ".json"]:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        
        if text:
            self.add_text(text)
