import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, Bell } from 'lucide-react';

const SettingsModal = ({ onClose }) => {
    const [darkMode, setDarkMode] = useState(true);
    const [sound, setSound] = useState(true);
    const [notifications, setNotifications] = useState(false);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="settings-section">
                    <h3>Appearance</h3>
                    <div className="setting-item">
                        <div className="setting-info">
                            <span className="setting-label">Theme</span>
                            <span className="setting-desc">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                        </div>
                        <button
                            className={`toggle-switch ${darkMode ? 'active' : ''}`}
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            <div className="toggle-knob">
                                {darkMode ? <Moon size={12} /> : <Sun size={12} />}
                            </div>
                        </button>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Preferences</h3>
                    <div className="setting-item">
                        <div className="setting-info">
                            <div className="icon-label">
                                <Volume2 size={18} />
                                <span className="setting-label">Sound Effects</span>
                            </div>
                        </div>
                        <button
                            className={`toggle-switch ${sound ? 'active' : ''}`}
                            onClick={() => setSound(!sound)}
                        >
                            <div className="toggle-knob" />
                        </button>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <div className="icon-label">
                                <Bell size={18} />
                                <span className="setting-label">Notifications</span>
                            </div>
                        </div>
                        <button
                            className={`toggle-switch ${notifications ? 'active' : ''}`}
                            onClick={() => setNotifications(!notifications)}
                        >
                            <div className="toggle-knob" />
                        </button>
                    </div>
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
          width: 400px;
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
          margin-bottom: 2rem;
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

        .settings-section {
          margin-bottom: 2rem;
        }

        .settings-section h3 {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--color-text-muted);
          margin-bottom: 1rem;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .icon-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-white);
        }

        .setting-label {
          color: var(--color-text-white);
          font-size: 1rem;
        }

        .setting-desc {
          color: var(--color-text-muted);
          font-size: 0.8rem;
        }

        .toggle-switch {
          width: 50px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          border: none;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-switch.active {
          background: var(--color-accent-orange);
        }

        .toggle-knob {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }

        .toggle-switch.active .toggle-knob {
          left: 24px;
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

export default SettingsModal;
