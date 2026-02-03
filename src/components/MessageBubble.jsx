import React from 'react';

import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ type, content }) => {
  const isUser = type === 'user';

  return (
    <div className={`message-container ${isUser ? 'user' : 'ai'}`}>

      <div className="bubble">
        {isUser ? content : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>

      <style>{`
        .message-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          max-width: 80%;
          animation: fadeIn 0.3s ease-out;
        }

        .message-container.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .message-container.ai {
          margin-right: auto;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-white);
          border: 1px solid var(--glass-border);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .bubble {
          padding: 1rem 1.5rem;
          border-radius: 18px;
          font-size: 1rem;
          line-height: 1.6;
          position: relative;
          overflow-wrap: break-word;
          word-break: break-word; /* Ensure long words break */
          max-width: 100%; /* Ensure it doesn't exceed container */
        }

        .user .bubble {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-accent-orange);
          color: var(--color-text-white);
          border-bottom-right-radius: 4px;
          box-shadow: 0 0 15px rgba(255, 140, 66, 0.1);
          backdrop-filter: blur(5px);
        }

        .ai .bubble {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--color-text-white);
          padding-left: 1.5rem; /* Restore padding */
          text-shadow: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Markdown Styles */
        .ai .bubble p {
          margin-bottom: 1rem;
        }
        
        .ai .bubble p:last-child {
          margin-bottom: 0;
        }

        .ai .bubble strong {
          color: var(--color-accent-orange);
          font-weight: 600;
        }

        .ai .bubble ul, .ai .bubble ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .ai .bubble li {
          margin-bottom: 0.5rem;
        }

        .ai .bubble code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        .ai .bubble pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 1rem;
          border: 1px solid var(--glass-border);
        }

        .ai .bubble pre code {
          background: transparent;
          padding: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MessageBubble;
