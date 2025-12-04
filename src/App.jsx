import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { api } from './services/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'search', 'history', 'settings'
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

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

    // If no session, create one first
    if (!activeSessionId) {
      try {
        const session = await api.createSession(text.slice(0, 30) + (text.length > 30 ? '...' : '')); // Use first message as title
        activeSessionId = session.id;
        setCurrentSessionId(activeSessionId);
        // Refresh list immediately
        await loadSessions();
      } catch (error) {
        console.error('Failed to create session:', error);
        return;
      }
    }

    // Add user message
    const newMessages = [...messages, { type: 'user', content: text, file }];
    setMessages(newMessages);
    setIsLoading(true);

    // Add initial empty AI message immediately
    setMessages(prev => [...prev, { type: 'ai', content: '' }]);

    try {
      const response = await api.sendMessage(activeSessionId, text, file);

      // Streaming logic
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;

        setMessages(prev => {
          const newMsgs = [...prev];
          // Update the last message (which is the AI message)
          if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].type === 'ai') {
            newMsgs[newMsgs.length - 1].content = aiContent;
          }
          return newMsgs;
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isThinking);
        return [...filtered, {
          type: 'ai',
          content: `Error: ${error.message}. (Ensure backend is running on port 8000)`
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

  return (
    <div className="app-container">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSwitchSession={switchSession}
        onNewChat={handleNewChat}
        onSearch={() => setActiveModal('search')}
        onHistory={() => setActiveModal('history')}
        onSettings={() => setActiveModal('settings')}
      />
      <ChatArea messages={messages} onSendMessage={handleSendMessage} />

      {/* Modals can be updated later if needed */}
      {activeModal === 'search' && <div className="modal-placeholder">Search Modal</div>}
      {activeModal === 'history' && <div className="modal-placeholder">History Modal</div>}
      {activeModal === 'settings' && <div className="modal-placeholder">Settings Modal</div>}

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
