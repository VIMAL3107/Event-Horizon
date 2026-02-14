import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AuthPage from './components/AuthPage';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

function App() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'search', 'history', 'settings'
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Load sessions on mount or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createNewSession = async () => {
    try {
      const session = await api.createSession();
      setCurrentSessionId(session.id);
      setMessages([]);
      loadSessions();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const switchSession = async (sessionId) => {
    try {
      setCurrentSessionId(sessionId);
      const msgs = await api.getSessionMessages(sessionId);
      // Map DB messages to UI format
      setMessages(msgs.map(m => ({
        type: m.role === 'user' ? 'user' : 'ai',
        content: m.content,
        fileType: m.type === 'file' ? 'file' : null // Simple handling for now
      })));
    } catch (error) {
      console.error('Failed to load session messages:', error);
    }
  };

  const handleSendMessage = async (text, file = null) => {
    let activeSessionId = currentSessionId;

    // 1. If no session, create one first
    if (!activeSessionId) {
      try {
        const session = await api.createSession(text.slice(0, 30) + (text.length > 30 ? '...' : ''));
        activeSessionId = session.id;
        setCurrentSessionId(activeSessionId);
        await loadSessions();
      } catch (error) {
        console.error('Failed to create session:', error);
        setMessages(prev => [...prev, { type: 'ai', content: `Error: Could not create chat session. ${error.message}` }]);
        return;
      }
    }

    // 2. Optimistic Update: Show User Message + "Thinking" Placeholder
    const tempUserMsg = { type: 'user', content: text, file };
    const tempAiMsg = { type: 'ai', content: '...', isThinking: true }; // Placeholder

    setMessages(prev => [...prev, tempUserMsg, tempAiMsg]);
    setIsLoading(true);

    try {
      // 3. Send Message
      const response = await api.sendMessage(activeSessionId, text, file);

      // 4. Stream Response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;

        // Update the AI message in the UI
        setMessages(prev => {
          const newMsgs = [...prev];

          // Find the last message (which should be our AI placeholder)
          // We look from the end. It might not be the last one if the user typed fast, 
          // but valid for this single-user flow.
          const lastMsgIndex = newMsgs.length - 1;

          if (lastMsgIndex >= 0) {
            const lastMsg = newMsgs[lastMsgIndex];
            // Ensure we are updating the AI message
            if (lastMsg.type === 'ai') {
              newMsgs[lastMsgIndex] = {
                ...lastMsg,
                content: aiContent,
                isThinking: false // Remove thinking flag once we have data
              };
            }
          }
          return newMsgs;
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the "Thinking" placeholder and show error
      setMessages(prev => {
        // Filter out the "Thinking" placeholder if it exists and hasn't effectively changed
        const filtered = prev.filter(msg => !msg.isThinking);
        return [...filtered, {
          type: 'ai',
          content: `Error: ${error.message}. (Ensure the backend is running and reachable)`
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setActiveModal(null);
  };

  const handleDeleteSession = async (sessionId) => {
    // Confirm before delete
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      await api.deleteSession(sessionId);
      // If the deleted session was active, switch to the first available or clear
      if (sessionId === currentSessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId);
        if (remaining.length > 0) {
          switchSession(remaining[0].id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
          createNewSession(); // Create a new one if all empty
        }
      }
      loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    try {
      await api.renameSession(sessionId, newTitle);
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, title: newTitle } : s
      ));
    } catch (error) {
      console.error('Failed to rename session:', error);
      alert("Failed to rename chat.");
    }
  };

  if (authLoading) {
    return (
      <div className="cosmic-loader-container">
        <div className="loader-orbit"><div className="loader-planet"></div></div>
        <p>Initializing Cosmic Connection...</p>
        <style>{`
          .cosmic-loader-container {
             height: 100vh; width: 100vw; background: #050505;
             display: flex; flex-direction: column; align-items: center; justify-content: center;
             gap: 2rem; color: #ff8c42; font-family: sans-serif;
          }
          .loader-orbit {
            width: 60px; height: 60px; border: 1px solid rgba(255, 140, 66, 0.2);
            border-radius: 50%; position: relative; animation: rotate 2s linear infinite;
          }
          .loader-planet {
            width: 12px; height: 12px; background: #ff8c42; border-radius: 50%;
            position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
            box-shadow: 0 0 15px #ff8c42;
          }
          @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Allow direct access to chat even if not authenticated
  // We will show the AuthPage as a modal or just let them stay anonymous.
  // For now, if not authenticated and trying to access a protected feature, 
  // we could show it, but the user wants "direct open chat".

  // Effect to close auth modal on successful login
  useEffect(() => {
    if (isAuthenticated && activeModal === 'auth') {
      setActiveModal(null);
    }
  }, [isAuthenticated, activeModal]);

  return (
    <div className="app-container">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSwitchSession={switchSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onSearch={() => setActiveModal('search')}
        onHistory={() => setActiveModal('history')}
        onSettings={() => setActiveModal('settings')}
      />
      <ChatArea messages={messages} onSendMessage={handleSendMessage} />

      {activeModal === 'search' && <div className="modal-placeholder">Search Modal</div>}
      {activeModal === 'history' && <div className="modal-placeholder">History Modal</div>}
      {activeModal === 'settings' && <div className="modal-placeholder">Settings Modal</div>}
      {activeModal === 'auth' && (
        <div className="auth-modal-overlay">
          <button className="close-auth-btn" onClick={() => setActiveModal(null)}><X size={24} /></button>
          <AuthPage onComplete={() => setActiveModal(null)} />
          <style>{`
            .auth-modal-overlay {
              position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
              z-index: 2000; display: flex; align-items: center; justify-content: center;
              background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            }
            .close-auth-btn {
              position: absolute; top: 2rem; right: 2rem; color: #fff;
              background: none; border: none; cursor: pointer; z-index: 2001;
            }
          `}</style>
        </div>
      )}

      <style>{`
  .app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-bg-deep);
}
        .modal-placeholder {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #222;
  padding: 2rem;
  border-radius: 10px;
  z-index: 100;
  color: white;
}
`}</style>
    </div>
  );
}

export default App;
