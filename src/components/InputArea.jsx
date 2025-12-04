import React, { useState, useRef } from 'react';
import { Send, Plus, Image, Music, FileText, X } from 'lucide-react';

const InputArea = ({ onSendMessage, isCentered }) => {
  const [input, setInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() || selectedFile) {
      onSendMessage(input, selectedFile);
      setInput('');
      setSelectedFile(null);
      setShowMenu(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowMenu(false);
    }
  };

  const triggerFileUpload = (acceptType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`input-wrapper ${isCentered ? 'centered' : 'bottom'}`}>
      <form className="input-area" onSubmit={handleSubmit}>
        <div className="input-container">
          <div className="upload-menu-container">
            <button
              type="button"
              className={`upload-btn ${showMenu ? 'active' : ''}`}
              onClick={() => setShowMenu(!showMenu)}
            >
              <Plus size={20} />
            </button>

            {showMenu && (
              <div className="upload-options">
                <button
                  type="button"
                  className="option-btn"
                  title="Upload Image"
                  onClick={() => triggerFileUpload('image/*')}
                >
                  <Image size={18} />
                </button>
                <button
                  type="button"
                  className="option-btn"
                  title="Upload Music"
                  onClick={() => triggerFileUpload('audio/*')}
                >
                  <Music size={18} />
                </button>
                <button
                  type="button"
                  className="option-btn"
                  title="Upload Document"
                  onClick={() => triggerFileUpload('.pdf,.txt,.doc,.docx')}
                >
                  <FileText size={18} />
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <div className="input-field-container">
            {selectedFile && (
              <div className="file-preview">
                <span className="file-name">{selectedFile.name}</span>
                <button type="button" className="remove-file" onClick={() => setSelectedFile(null)}>
                  <X size={14} />
                </button>
              </div>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedFile ? "Add a message..." : "Ask Anything"}
              className="chat-input"
            />
          </div>

          <button
            type="submit"
            className={`send-button ${input.trim() || selectedFile ? 'active' : ''}`}
            disabled={!input.trim() && !selectedFile}
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      <style>{`
        .input-wrapper {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 900px;
          padding: 0 2rem;
          z-index: 20;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-wrapper.centered {
          top: 55%;
          transform: translate(-50%, -50%);
          max-width: 700px;
        }

        .input-wrapper.bottom {
          bottom: 2rem;
          transform: translateX(-50%);
        }

        .input-area {
          width: 100%;
        }

        .input-container {
          position: relative;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          padding: 0.3rem;
          display: flex;
          align-items: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
        }

        .input-wrapper.centered .input-container {
          padding: 0.5rem;
          border-radius: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }

        .input-container:focus-within {
          border-color: rgba(255, 140, 66, 0.5);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 140, 66, 0.1);
        }

        .upload-menu-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .upload-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          padding: 0.6rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-btn:hover, .upload-btn.active {
          color: var(--color-text-white);
          background: rgba(255, 255, 255, 0.1);
        }

        .upload-btn.active {
          transform: rotate(45deg);
        }

        .upload-options {
          position: absolute;
          bottom: 100%;
          left: 0;
          margin-bottom: 1rem;
          background: rgba(18, 18, 18, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          animation: slideUp 0.2s ease-out;
          box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        }

        .option-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          padding: 0.6rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .option-btn:hover {
          background: rgba(255, 140, 66, 0.1);
          color: var(--color-accent-orange);
        }

        .input-field-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .file-preview {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.2rem 1rem;
            font-size: 0.8rem;
            color: var(--color-accent-orange);
        }

        .remove-file {
            background: none;
            border: none;
            color: var(--color-text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
        }
        
        .remove-file:hover {
            color: var(--color-text-white);
        }

        .chat-input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--color-text-white);
          padding: 0.8rem 1rem;
          font-size: 1rem;
          font-family: var(--font-primary);
          outline: none;
        }

        .chat-input::placeholder {
          color: var(--color-text-muted);
        }

        .send-button {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          padding: 0.6rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-button.active {
          color: var(--color-accent-orange);
          background: rgba(255, 140, 66, 0.1);
          box-shadow: 0 0 15px var(--color-accent-orange);
        }

        .send-button.active:hover {
          transform: scale(1.1);
          background: rgba(255, 140, 66, 0.2);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default InputArea;
