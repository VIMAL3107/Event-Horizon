import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, MessageSquare, Settings, User, ChevronLeft, ChevronRight, Search, X,
  MoreHorizontal, Share, Users, Edit2, FolderInput, Pin, Archive, Trash2
} from 'lucide-react';

const BlackHoleLogo = () => (
  <div className="black-hole-container">
    <div className="accretion-disk"></div>
    <div className="event-horizon"></div>
    <style>{`
      .black-hole-container {
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .event-horizon {
        width: 20px;
        height: 20px;
        background: #000;
        border-radius: 50%;
        box-shadow: 0 0 10px #000, inset 0 0 5px rgba(255, 255, 255, 0.2);
        z-index: 2;
        position: relative;
      }

      .accretion-disk {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          transparent 0%,
          #ff8c42 20%,
          #ff3c00 40%,
          transparent 60%,
          #ff8c42 80%,
          #ff3c00 100%
        );
        filter: blur(2px);
        animation: spin 4s linear infinite;
        opacity: 0.8;
        box-shadow: 0 0 15px rgba(255, 140, 66, 0.4);
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const Sidebar = ({ onNewChat, onSearch, onSettings, sessions = [], currentSessionId, onSwitchSession, onDeleteSession, onRenameSession }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setIsSearchActive(true);
  };

  const handleCloseSearch = (e) => {
    e.stopPropagation();
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const toggleMenu = (e, sessionId) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveMenuId(activeMenuId === sessionId ? null : sessionId);
  };

  const handleMenuAction = (e, action, session) => {
    e.stopPropagation();
    setActiveMenuId(null);

    switch (action) {
      case 'delete':
        onDeleteSession && onDeleteSession(session.id);
        break;
      case 'rename':
        const newTitle = prompt("Enter new chat name:", session.title);
        if (newTitle) onRenameSession && onRenameSession(session.id, newTitle);
        break;
      default:
        console.log(`Action ${action} not implemented yet`);
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logo-container">
        <BlackHoleLogo />
        {!isCollapsed && <span className="logo-text">Event Horizon</span>}
      </div>

      <div className="main-actions">
        <button className="action-btn new-chat" onClick={onNewChat} title="New Chat">
          <Plus size={20} />
          {!isCollapsed && <span>New Chat</span>}
        </button>

        {isSearchActive && !isCollapsed ? (
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon-input" />
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button className="close-search-btn" onClick={handleCloseSearch}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <button className="action-btn" onClick={handleSearchClick} title="Search">
            <Search size={20} />
            {!isCollapsed && <span>Search</span>}
          </button>
        )}
      </div>

      <div className="recent-chats-section">
        {!isCollapsed && <div className="section-title">Recent Chats</div>}
        <div className="chat-list">
          {filteredSessions.length === 0 ? (
            !isCollapsed && <div className="empty-state">
              {searchQuery ? 'No matches found' : 'No recent chats'}
            </div>
          ) : (
            filteredSessions.map(session => (
              <div key={session.id} className="chat-item-wrapper" style={{ position: 'relative' }}>
                <button
                  className={`chat-item ${currentSessionId === session.id ? 'active' : ''}`}
                  onClick={() => onSwitchSession(session.id)}
                  title={session.title}
                >
                  <MessageSquare size={18} className="chat-icon" />
                  {!isCollapsed && <span className="chat-label">{session.title}</span>}

                  {!isCollapsed && (
                    <div className="chat-options-trigger" onClick={(e) => toggleMenu(e, session.id)}>
                      <MoreHorizontal size={16} />
                    </div>
                  )}
                </button>

                {/* Context Menu */}
                {activeMenuId === session.id && (
                  <div className="context-menu" ref={menuRef}>
                    <div className="menu-item" onClick={(e) => handleMenuAction(e, 'share', session)}>
                      <Share size={14} /> <span>Share</span>
                    </div>
                    <div className="menu-item" onClick={(e) => handleMenuAction(e, 'group', session)}>
                      <Users size={14} /> <span>Start a group chat</span>
                    </div>
                    <div className="menu-item" onClick={(e) => handleMenuAction(e, 'rename', session)}>
                      <Edit2 size={14} /> <span>Rename</span>
                    </div>
                    <div className="menu-item" onClick={(e) => handleMenuAction(e, 'move', session)}>
                      <FolderInput size={14} /> <span>Move to project</span> <ChevronRight size={12} className="menu-arrow" />
                    </div>
                    <div className="menu-splitter"></div>
                    <div className="menu-item" onClick={(e) => handleMenuAction(e, 'pin', session)}>
                      <Pin size={14} /> <span>Pin chat</span>
                    </div>
                    <div className="menu-item" onClick={(e) => handleMenuAction(e, 'archive', session)}>
                      <Archive size={14} /> <span>Archive</span>
                    </div>
                    <div className="menu-item delete" onClick={(e) => handleMenuAction(e, 'delete', session)}>
                      <Trash2 size={14} /> <span>Delete</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="footer-actions">
        <button className="nav-item" onClick={onSettings} title="Settings & Help">
          <Settings size={20} />
          {!isCollapsed && <span className="nav-label">Settings & Help</span>}
        </button>
        <button className="nav-item" title="Profile">
          <User size={20} />
          {!isCollapsed && <span className="nav-label">Profile</span>}
        </button>
        <button
          className="nav-item toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span className="nav-label">Collapse</span>}
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          position: relative;
          z-index: 10;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .sidebar.collapsed {
          width: 80px;
          padding: 1.5rem 0.5rem;
        }

        .logo-container {
          margin-bottom: 2rem;
          padding: 0 0.5rem;
          color: var(--color-text-white);
          display: flex;
          align-items: center;
          gap: 1rem;
          white-space: nowrap;
          justify-content: center; /* Center logo when collapsed */
        }
        
        .sidebar:not(.collapsed) .logo-container {
            justify-content: flex-start;
        }

        .logo-text {
          font-weight: 600;
          letter-spacing: 1px;
          animation: fadeIn 0.3s ease;
        }

        .main-actions {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-bottom: 2rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--color-text-white);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .action-btn.new-chat {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-btn.new-chat:hover {
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
        }
        
        .sidebar.collapsed .action-btn {
            justify-content: center;
            padding: 0.8rem;
        }

        .recent-chats-section {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 1rem;
          /* Hide scrollbar */
          scrollbar-width: none; 
        }
        
        .recent-chats-section::-webkit-scrollbar {
            display: none;
        }

        .section-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin-bottom: 0.8rem;
          padding-left: 0.8rem;
          letter-spacing: 1px;
        }

        .chat-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .chat-item-wrapper {
            position: relative;
        }

        .chat-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
          overflow: hidden;
          position: relative;
          padding-right: 2rem; /* Make space for the dots */
        }

        .chat-item:hover, .chat-item.active {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-white);
        }
        
        .sidebar.collapsed .chat-item {
            justify-content: center;
            padding: 0.6rem;
        }

        .chat-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.9rem;
          flex: 1;
        }
        
        .chat-icon {
            flex-shrink: 0;
        }

        /* Dots Trigger */
        .chat-options-trigger {
            position: absolute;
            right: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0;
            padding: 0.3rem;
            border-radius: 4px;
            color: var(--color-text-muted);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            background: transparent;
        }

        .chat-item:hover .chat-options-trigger,
        .chat-options-trigger:hover {
            opacity: 1;
        }
        
        .chat-options-trigger:hover {
            background: rgba(255,255,255,0.1);
            color: white;
        }
        
        /* Context Menu */
        .context-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: #252525;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 0.5rem;
            min-width: 220px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 2px;
            animation: fadeIn 0.1s ease-out;
        }

        .menu-item {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            padding: 0.6rem 0.8rem;
            color: #e0e0e0;
            font-size: 0.9rem;
            cursor: pointer;
            border-radius: 6px;
            transition: background 0.2s;
        }

        .menu-item:hover {
            background: rgba(255,255,255,0.1);
        }
        
        .menu-item.delete {
            color: #ff5555;
        }
        
        .menu-item.delete:hover {
            background: rgba(255, 85, 85, 0.1);
        }

        .menu-splitter {
            height: 1px;
            background: rgba(255,255,255,0.1);
            margin: 0.4rem 0;
        }

        .menu-arrow {
            margin-left: auto;
            opacity: 0.5;
        }

        .footer-actions {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .nav-item:hover {
          color: var(--color-text-white);
          background: rgba(255, 255, 255, 0.05);
        }
        
        .sidebar.collapsed .nav-item {
            justify-content: center;
        }

        .toggle-btn {
            /* Inherits nav-item styles now, just add specific tweaks if needed */
        }

        .empty-state {
          padding: 0.8rem;
          color: var(--color-text-muted);
          font-size: 0.9rem;
          font-style: italic;
          text-align: center;
          opacity: 0.7;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.4rem 0.6rem;
          height: 42px; /* Match button height roughly */
          animation: fadeIn 0.2s ease;
        }

        .sidebar-search-input {
          background: transparent;
          border: none;
          color: var(--color-text-white);
          width: 100%;
          margin-left: 0.5rem;
          outline: none;
          font-size: 0.9rem;
        }

        .search-icon-input {
          color: var(--color-text-muted);
        }

        .close-search-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.2rem;
          border-radius: 50%;
        }

        .close-search-btn:hover {
          color: var(--color-text-white);
          background: rgba(255, 255, 255, 0.1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
