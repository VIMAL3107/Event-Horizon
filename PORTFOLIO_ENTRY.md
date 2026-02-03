# Project Name: Event Horizon AI
*Alternative Names: Horizon Chat, Nebula AI, Gemini Nexus*

## 🚀 Project Overview
**Event Horizon AI** is a next-generation, multimodal AI assistant interface designed to bridge the gap between users and advanced LLMs. Built with clarity and speed in mind, it leverages Google's Gemini models to process not just text, but images, audio, and documents in real-time. The application features a persistent memory system, allowing users to maintain context across different sessions, all wrapped in a sleek, modern, glassmorphism-inspired UI.

## 🎯 What We Are Doing (The Goal)
The goal of this project is to create a personalizable, robust, and privacy-conscious AI workspace. Unlike standard chat interfaces, Event Horizon focuses on:
1.  **Multimodal Fluidity:** Seamlessly mixing text, voice, and visual inputs in a single conversation flow.
2.  **Context Retention:** Storing conversation history locally using SQLite to ensure the AI remembers past interactions within a session.
3.  **Modern UX/UI:** Delivering a premium user experience with responsive design, smooth animations, and a focus on visual aesthetics.

## ✨ Key Features
-   **Multimodal Intelligence:** Upload images, audio files, or documents for the AI to analyze and respond to.
-   **RAG Knowledge Base:** Train the AI on your own custom data (PDFs, docs) for personalized, context-aware answers.
-   **Streaming Responses:** Experience real-time AI thinking with token-by-token streaming responses.
-   **Session Management:** Create, switch between, and manage multiple chat history sessions.
-   **Persistent Memory:** All conversations are saved locally, ensuring no data is lost upon refresh.
-   **Responsive Design:** Fully optimized for both desktop and mobile viewing with a "glass" aesthetic.

## 🛠️ Tech Stack
-   **Frontend:** React.js, Vite, Lucide React (Icons), CSS3 (Custom Glassmorphism System)
-   **Backend:** Python, FastAPI, SQLite
-   **AI & Data:** Google Gemini Pro, LangChain, ChromaDB (Vector Store)

## 💡 Technical Highlights
-   **Advanced RAG Pipeline:** Integrated **LangChain** and **ChromaDB** to create a searchable vector database, allowing the AI to "read" and recall user-provided documents.
-   **FastAPI Backend:** Handles asynchronous non-blocking IO for AI streaming and WebSocket connections.
-   **Custom SQLite Schema:** Efficiently maps sessions and messages to serve chat history instantly.
-   **State Management:** Complex React state handling for mixed media messages, file previews, and real-time updates.
