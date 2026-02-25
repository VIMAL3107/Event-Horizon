import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import InputArea from './InputArea';

const ChatArea = ({ messages, onSendMessage }) => {
  const messagesEndRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  const scrollToBottom = (behavior = "auto") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    // Use 'auto' for immediate jump on new messages during streaming
    // Use 'smooth' only for the very first load or when streaming finishes
    scrollToBottom("auto");
  }, [messages]);

  return (
    <main className="chat-area">
      {/* Background Video or Fallback Animation */}
      <div className="video-background">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="bg-video"
            onError={() => setVideoError(true)}
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="cosmic-animation"></div>
        )}
        <div className="vignette"></div>
      </div>

      <div className="messages-wrapper" id="messages-scroll-area">
        <div className="messages-list">
          {messages.map((msg, index) => (
            <MessageBubble key={index} type={msg.type} content={msg.content} />
          ))}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>
      </div>

      <InputArea
        onSendMessage={onSendMessage}
        isCentered={messages.length === 0}
      />

      <style>{`
        .chat-area {
          flex: 1;
          position: relative;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .video-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background: #000;
          overflow: hidden;
        }

        .bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
        }

        /* CSS-based cosmic animation as fallback */
        .cosmic-animation {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200vmax;
          height: 200vmax;
          background: radial-gradient(circle at center, 
            rgba(255, 140, 66, 0.1) 0%, 
            rgba(0, 0, 0, 0) 40%, 
            rgba(0, 0, 0, 1) 100%);
          transform: translate(-50%, -50%);
          animation: rotate 60s linear infinite;
        }

        .cosmic-animation::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
            radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
            radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px);
          background-size: 550px 550px, 350px 350px, 250px 250px;
          background-position: 0 0, 40px 60px, 130px 270px;
        }

        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .vignette {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, transparent 30%, #050505 120%);
          pointer-events: none;
        }

        .messages-wrapper {
          flex: 1;
          position: relative;
          z-index: 10;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 2rem 2rem 10rem 2rem; /* Bottom padding for input area */
          display: flex;
          flex-direction: column;
          scroll-behavior: auto;
        }

        .messages-list {
          max-width: 1000px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          min-height: min-content;
        }
      `}</style>
    </main>
  );
};

export default ChatArea;
