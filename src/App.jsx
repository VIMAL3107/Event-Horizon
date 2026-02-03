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
          content: `Error: ${error.message}. (Ensure backend is running at http://localhost:8000)`
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
