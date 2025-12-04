import React from 'react';
import { X, MessageSquare, Clock } from 'lucide-react';

const HistoryPanel = ({ onClose }) => {
    const mockHistory = [
        { id: 1, title: "What is Python?", date: "Today" },
        { id: 2, title: "Quantum Physics Basics", date: "Yesterday" },
        { id: 3, title: "React Component Structure", date: "Nov 24" },
        { id: 4, title: "Recipe for Lasagna", date: "Nov 20" },
    ];

    return (
        <div className="panel-overlay" onClick={onClose}>
            <div className="panel-content" onClick={e => e.stopPropagation()}>
                <div className="panel-header">
                    <h2>Chat History</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="history-list">
                    {mockHistory.map(item => (
                        <div key={item.id} className="history-item">
                            <div className="history-icon">
                                <MessageSquare size={18} />
                            </div>
                            <div className="history-details">
                                <span className="history-title">{item.title}</span>
                                <span className="history-date">{item.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(2px);
          z-index: 90;
          animation: fadeIn 0.2s ease;
        }

        .panel-content {
          position: absolute;
          top: 0;
          left: 0;
          height: 100vh;
          width: 300px;
          background: rgba(10, 10, 10, 0.98);
          border-right: 1px solid var(--glass-border);
          padding: 2rem 1.5rem;
          box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
          animation: slideRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .panel-header h2 {
          font-size: 1.2rem;
          color: var(--color-text-white);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .history-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .history-icon {
          color: var(--color-text-muted);
        }

        .history-item:hover .history-icon {
          color: var(--color-accent-orange);
        }

        .history-details {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .history-title {
          color: var(--color-text-white);
          font-size: 0.95rem;
        }

        .history-date {
          color: var(--color-text-muted);
          font-size: 0.8rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
        </div>
    );
};

export default HistoryPanel;
