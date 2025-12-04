import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

const SearchModal = ({ onClose }) => {
    const [query, setQuery] = useState('');

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Search History</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="search-input-container">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="search-results">
                    {query ? (
                        <div className="no-results">No results found for "{query}"</div>
                    ) : (
                        <div className="placeholder-text">Type to search...</div>
                    )}
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: rgba(18, 18, 18, 0.95);
          border: 1px solid var(--glass-border);
          width: 500px;
          max-width: 90%;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: scaleUp 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.2rem;
          color: var(--color-text-white);
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text-white);
        }

        .search-input-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .search-input-container input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          padding: 0.8rem 1rem 0.8rem 3rem;
          border-radius: 12px;
          color: var(--color-text-white);
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }

        .search-input-container input:focus {
          border-color: var(--color-accent-orange);
          box-shadow: 0 0 15px rgba(255, 140, 66, 0.1);
        }

        .search-results {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default SearchModal;
