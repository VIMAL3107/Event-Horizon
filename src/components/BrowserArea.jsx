
import React, { useState, useRef, useEffect } from 'react';
import {
    Globe, Plus, Minus, Square, X,
    ArrowLeft, ArrowRight, RotateCw, Mic,
    Search, Star, Puzzle, ChevronDown,
    ShieldCheck, Users, Lightbulb, Calendar, Paperclip,
    SendHorizontal, Wand2, Settings, Mail,
    HelpCircle, LayoutTemplate, Loader2, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import automationBridge from '../services/automationBridge';
import AIAnswerPage from './AIAnswerPage';
import AssistantPanel from './AssistantPanel';
import HomePage from './HomePage';
import { useAuth } from '../context/AuthContext';

const BrowserArea = ({ tabs, activeTabId, onSwitchTab, onCloseTab, onNewTab, onUpdateTab }) => {
    const { isAuthenticated, user, logout } = useAuth();
    // Derived state from active tab
    const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
    const activeUrl = activeTab?.url || '';

    const [inputValue, setInputValue] = useState(''); // Center Input
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [urlBarValue, setUrlBarValue] = useState(''); // Top URL Bar

    // Sync URL bar when switching tabs
    useEffect(() => {
        setUrlBarValue(activeUrl);
        setInputValue('');
        // Always reset AI mode when switching tabs
        setAiMode(false);
        setAiAnswer('');
        setAiQuery('');
        setAiSources([]);
        setAiSteps([]);
    }, [activeTabId]);

    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // AI Full-Page State (Perplexity mode)
    const [aiMode, setAiMode] = useState(false);
    const [aiQuery, setAiQuery] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [aiSources, setAiSources] = useState([]);
    const [aiSteps, setAiSteps] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);

    // Legacy AI Sidebar (for page context)
    const [showAI, setShowAI] = useState(false);
    const [aiQuestion, setAiQuestion] = useState('');
    const [sidebarAnswer, setSidebarAnswer] = useState('');
    const [sidebarLoading, setSidebarLoading] = useState(false);

    const webviewRef = useRef(null);

    // Helper for placeholder features
    const showFeatureNotImplemented = (featureName) => {
        console.log(`Feature not yet implemented: ${featureName}`);
    };

    // AI Query Handler - Full page Perplexity mode
    const handleAIQuery = async (query) => {
        setAiMode(true);
        setAiQuery(query);
        setAiLoading(true);
        setAiAnswer('');
        setAiSources([]);
        setAiSteps([]);

        // Update tab title with the query
        onUpdateTab(activeTabId, { title: query.slice(0, 30) + (query.length > 30 ? '...' : '') });

        try {
            const result = await api.ask('', query);
            setAiAnswer(result.answer || '');
            setAiSources(result.sources || []);
            setAiSteps(result.steps || []);
        } catch (err) {
            setAiAnswer(`Error: ${err.message}`);
        } finally {
            setAiLoading(false);
        }
    };

    // Follow-up question handler
    const handleFollowUp = (query) => {
        handleAIQuery(query);
    };

    // Sidebar AI (for webview page context)
    const askQuestion = async () => {
        if (!aiQuestion.trim()) return;
        setSidebarLoading(true);
        setSidebarAnswer('');

        let pageContent = '';
        try {
            if (webviewRef.current && activeUrl) {
                pageContent = await webviewRef.current.executeJavaScript(
                    `document.body.innerText.substring(0, 50000)`
                );
            }
        } catch (err) {
            console.log('Could not extract page content:', err.message);
            pageContent = `URL: ${activeUrl}`;
        }

        try {
            const result = await api.ask(pageContent, aiQuestion);
            setSidebarAnswer(result.answer || '');
        } catch (err) {
            setSidebarAnswer(`Error: ${err.message}`);
        } finally {
            setSidebarLoading(false);
        }
    };

    // Handle URL navigation
    const navigateTo = (url) => {
        let finalUrl = url;
        if (!url.startsWith('http')) {
            // Check if it looks like a URL (has dot, no spaces)
            if (url.includes('.') && !url.includes(' ')) {
                finalUrl = `https://${url}`;
                onUpdateTab(activeTabId, { url: finalUrl });
            } else {
                // It's a query - use AI Answer mode instead of Google
                handleAIQuery(url);
                return; // Don't navigate to browser
            }
        } else {
            onUpdateTab(activeTabId, { url: finalUrl });
        }
    };

    // Center Input Handler - uses AI mode for queries
    const handleCenterSubmit = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            navigateTo(inputValue);
        }
    };

    // URL Bar Handler - always navigates (for explicit URLs)
    const handleUrlSubmit = (e) => {
        if (e.key === 'Enter' && urlBarValue.trim()) {
            // URL bar should always navigate, even for queries
            let url = urlBarValue.trim();
            if (!url.startsWith('http')) {
                if (url.includes('.') && !url.includes(' ')) {
                    url = `https://${url}`;
                } else {
                    url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
                }
            }
            onUpdateTab(activeTabId, { url });
        }
    };

    // Webview Event Listeners + Automation Bridge Setup
    useEffect(() => {
        const webview = webviewRef.current;
        if (!webview) return;

        // Wire up automation bridge for job automation features
        automationBridge.setWebview(webview);

        const handleLoadStart = () => setIsLoading(true);
        const handleLoadStop = () => {
            setIsLoading(false);
            setCanGoBack(webview.canGoBack());
            setCanGoForward(webview.canGoForward());
            // Update tab title and url in global state
            onUpdateTab(activeTabId, {
                title: webview.getTitle(),
                url: webview.getURL()
            });
        };

        webview.addEventListener('did-start-loading', handleLoadStart);
        webview.addEventListener('did-stop-loading', handleLoadStop);

        return () => {
            webview.removeEventListener('did-start-loading', handleLoadStart);
            webview.removeEventListener('did-stop-loading', handleLoadStop);
        };
    }, [activeTabId, activeUrl]); // Re-bind when tab/url changes

    return (
        <div style={{ ...styles.container, backgroundColor: isAuthenticated ? '#0c0c0e' : '#000000' }}>
            {/* Tab Bar */}
            <div style={{
                ...styles.tabBar,
                backgroundColor: isAuthenticated ? '#000000' : 'transparent',
                borderBottom: isAuthenticated ? '1px solid rgba(255,255,255,0.06)' : 'none'
            }}>

                {isAuthenticated && (
                    <div style={styles.tabGroup}>
                        {tabs.map(tab => {
                            const isActive = tab.id === activeTabId;
                            return (
                                <motion.div
                                    key={tab.id}
                                    onClick={() => onSwitchTab(tab.id)}
                                    style={{
                                        ...styles.tab,
                                        backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                                        opacity: isActive ? 1 : 0.6,
                                        cursor: 'pointer'
                                    }}
                                    initial={{ opacity: 0, y: -5 }} // Subtle pop-in
                                    animate={{ opacity: isActive ? 1 : 0.6, y: 0 }}
                                >
                                    {tab.url ?
                                        <img src={`https://www.google.com/s2/favicons?domain=${tab.url}`} width="14" height="14" alt="" style={{ opacity: 0.8 }} /> :
                                        <Globe size={14} className="opacity-70" color="#e4e4e7" />
                                    }
                                    <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {tab.title || 'New Tab'}
                                    </span>
                                    <button
                                        onClick={(e) => onCloseTab(tab.id, e)}
                                        style={{
                                            ...styles.windowBtnClose,
                                            marginLeft: '6px',
                                            opacity: 0.5,
                                            display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            );
                        })}

                        <motion.button
                            style={styles.newTabBtn}
                            onClick={onNewTab}
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Plus size={16} strokeWidth={2} />
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Navigation Bar - Only show when authenticated */}
            {isAuthenticated && (
                <div style={styles.navBar}>
                    <div style={styles.navControls}>
                        <motion.button
                            style={{ ...styles.navBtn, opacity: canGoBack ? 1 : 0.4 }}
                            onClick={() => webviewRef.current?.goBack()}
                            disabled={!canGoBack}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ArrowLeft size={16} strokeWidth={1.5} />
                        </motion.button>
                        <motion.button
                            style={{ ...styles.navBtn, opacity: canGoForward ? 1 : 0.4 }}
                            onClick={() => webviewRef.current?.goForward()}
                            disabled={!canGoForward}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ArrowRight size={16} strokeWidth={1.5} />
                        </motion.button>
                        <motion.button
                            style={styles.navBtn}
                            onClick={() => webviewRef.current?.reload()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <RotateCw size={14} strokeWidth={1.5} className={isLoading ? 'animate-spin' : ''} />
                        </motion.button>
                    </div>
                    <div style={styles.urlBar}>
                        <Search size={14} style={{ opacity: 0.4 }} />
                        <input
                            type="text"
                            placeholder="Search or enter URL"
                            style={styles.urlInput}
                            value={urlBarValue}
                            onChange={(e) => setUrlBarValue(e.target.value)}
                            onKeyDown={handleUrlSubmit}
                        />
                    </div>
                    <div style={styles.navRight}>
                        <button style={styles.iconBtn} onClick={() => showFeatureNotImplemented('Favorites')}><Star size={16} strokeWidth={1.5} /></button>
                        <button style={styles.iconBtn} onClick={() => showFeatureNotImplemented('Extensions')}><Puzzle size={16} strokeWidth={1.5} /></button>
                        <button style={styles.assistantBtn} onClick={() => setShowAI(!showAI)}>
                            <Wand2 size={12} fill="#d4d4d8" />
                            <span>Assistant</span>
                            <ChevronDown size={10} style={{ opacity: 0.5, transform: showAI ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                        </button>
                        <div style={{ position: 'relative' }}>
                            <button
                                style={{ ...styles.profileDot, border: 'none', cursor: 'pointer', padding: 0 }}
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                {user?.avatar ? (
                                    <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Profile" />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#a78bfa', color: 'white', borderRadius: '50%', fontSize: '10px' }}>
                                        {user?.name?.[0] || 'U'}
                                    </div>
                                )}
                            </button>

                            {showProfileMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    backgroundColor: '#1e1e1e',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    padding: '4px',
                                    zIndex: 50,
                                    width: '160px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                                }}>
                                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #333', marginBottom: '4px' }}>
                                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>{user?.name || 'User'}</div>
                                        <div style={{ color: '#a1a1aa', fontSize: '11px' }}>{user?.email || 'user@eventhorizon.ai'}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowProfileMenu(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '8px 12px',
                                            backgroundColor: 'transparent',
                                            color: '#ef4444',
                                            border: 'none',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span style={{ marginRight: 'auto' }}>Sign Out</span>
                                        <ArrowRight size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Area: AI Answer Page / Webview / Dashboard */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">
                    {/* AI Answer Page (Perplexity Mode) */}
                    {aiMode ? (
                        <motion.div
                            key="ai-answer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ flex: 1 }}
                        >
                            <AIAnswerPage
                                query={aiQuery}
                                answer={aiAnswer}
                                sources={aiSources}
                                steps={aiSteps}
                                isLoading={aiLoading}
                                onFollowUp={handleFollowUp}
                            />
                        </motion.div>
                    ) : !isAuthenticated ? (
                        <HomePage />
                    ) : activeUrl ? (
                        <motion.div
                            key="webview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'row' }}
                        >
                            <webview
                                ref={webviewRef}
                                src={activeUrl}
                                style={{ flex: 1, width: showAI ? 'calc(100% - 360px)' : '100%', border: 'none', transition: 'width 0.3s' }}
                                allowpopups="true"
                            />
                            {/* AssistantPanel moved outside */}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.3 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Logo Section */}
                            <div style={styles.logoSection}>
                                <h1 style={styles.logoText}>Event Horizon Chat</h1>
                            </div>

                            <div style={styles.mainContent}>
                                <div style={styles.centerInputWrapper}>
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleCenterSubmit}
                                            placeholder="Ask anything. Type @ for mentions and / for shortcuts."
                                            style={styles.centerInput}
                                            autoFocus
                                        />
                                    </motion.div>
                                    <motion.div
                                        style={styles.inputIcons}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <button style={styles.inputIconActive} onClick={() => navigateTo(inputValue)}>
                                            <Search size={16} strokeWidth={2} color="#0f172a" />
                                        </button>
                                        <button style={styles.inputIcon} onClick={() => showFeatureNotImplemented('People')}><Users size={16} strokeWidth={1.5} /></button>
                                        <button style={styles.inputIcon} onClick={() => showFeatureNotImplemented('Ideas')}><Lightbulb size={16} strokeWidth={1.5} /></button>
                                        <div style={styles.iconDivider}></div>
                                        <button style={styles.inputIcon} onClick={() => showFeatureNotImplemented('Browser')}><Globe size={16} strokeWidth={1.5} /></button>
                                        <button style={styles.inputIcon} onClick={() => showFeatureNotImplemented('Calendar')}><Calendar size={16} strokeWidth={1.5} /></button>
                                        <button style={styles.inputIcon} onClick={() => showFeatureNotImplemented('Attachments')}><Paperclip size={16} strokeWidth={1.5} /></button>
                                        <button style={styles.inputIcon} onClick={() => showFeatureNotImplemented('Voice')}><Mic size={16} strokeWidth={1.5} /></button>
                                        <motion.button
                                            style={styles.sendBtn}
                                            onClick={() => navigateTo(inputValue)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ArrowRight size={16} strokeWidth={2} />
                                        </motion.button>
                                    </motion.div>
                                </div>

                                <div style={styles.bottomActions}>
                                    <button
                                        style={styles.actionBtn}
                                        onClick={() => {
                                            setInputValue("What can you do?");
                                            // Ideally trigger submit immediately or let user press enter
                                            // let's simulate user intent
                                            navigateTo("What can you do?");
                                        }}
                                    >
                                        <Wand2 size={14} /> Try Assistant
                                    </button>
                                    <button style={styles.actionBtn} onClick={() => showFeatureNotImplemented('Customize')}>
                                        <Settings size={14} /> Customize
                                    </button>
                                    <button style={styles.actionBtn} onClick={() => showFeatureNotImplemented('Invite')}>
                                        <Mail size={14} /> Invite Friends
                                    </button>
                                </div>
                            </div>

                            <div style={styles.footer}>
                                <button style={styles.iconBtn} onClick={() => showFeatureNotImplemented('Layout')}><LayoutTemplate size={16} strokeWidth={1.5} /></button>
                                <button style={styles.iconBtn} onClick={() => showFeatureNotImplemented('Help')}><HelpCircle size={16} strokeWidth={1.5} /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Comet Assistant Panel - Works everywhere */}
                <AnimatePresence>
                    {showAI && (
                        <AssistantPanel
                            onClose={() => setShowAI(false)}
                            pageContent={''}
                            pageUrl={activeUrl}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
};

const styles = {
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0c0c0e', // Slightly lighter than pure black
        height: '100vh',
        fontFamily: '"Inter", sans-serif',
    },
    tabBar: {
        height: '44px',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    tabGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 12px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: '6px',
        color: '#e4e4e7',
        fontSize: '12px',
        fontWeight: '500',
        height: '28px',
        maxWidth: '200px',
    },
    tabIcon: {
        fontSize: '12px',
        opacity: 0.7,
    },
    newTabBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        color: '#71717a',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
    },
    windowControls: {
        display: 'flex',
        gap: '12px',
        opacity: 0.6,
    },
    windowBtn: {
        background: 'transparent',
        border: 'none',
        color: '#71717a',
        fontSize: '12px',
        cursor: 'pointer',
    },
    windowBtnClose: {
        background: 'transparent',
        border: 'none',
        color: '#71717a',
        fontSize: '12px',
        cursor: 'pointer',
        padding: '0 4px',
    },
    navBar: {
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    navControls: {
        display: 'flex',
        gap: '8px',
    },
    navBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        color: '#a1a1aa',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s',
    },
    urlBar: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#18181b', // Darker background for URL
        borderRadius: '8px',
        padding: '0 16px',
        height: '36px',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'border-color 0.2s',
    },
    urlIcon: {
        fontSize: '12px',
        opacity: 0.5,
    },
    urlInput: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: '#d4d4d8',
        fontSize: '13px',
        outline: 'none',
        fontFamily: 'inherit',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    starIcon: {
        color: '#71717a',
        fontSize: '16px',
        cursor: 'pointer',
    },
    extensionIcon: {
        color: '#71717a',
        fontSize: '14px',
        cursor: 'pointer',
    },
    assistantBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '6px',
        color: '#d4d4d8',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.05)',
    },
    chevron: {
        fontSize: '10px',
        opacity: 0.6,
    },
    profileDot: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2dd4bf, #3b82f6)', // Teal to blue
        boxShadow: '0 0 0 2px rgba(0,0,0,0.4)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    logoSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 16px 20px',
    },
    logoText: {
        fontSize: '48px',
        fontWeight: '500',
        color: '#ffffff',
        letterSpacing: '-0.04em',
        margin: 0,
        fontFamily: '"Outfit", sans-serif',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px 80px 20px', // More bottom padding to push content up slightly
    },
    centerInputWrapper: {
        width: '100%',
        maxWidth: '640px',
        marginBottom: '32px',
    },
    centerInput: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '20px 24px',
        color: '#f4f4f5',
        fontSize: '16px',
        outline: 'none',
        marginBottom: '16px',
        backdropFilter: 'blur(12px)', // Glass effect
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    inputIcons: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 12px',
    },
    inputIconActive: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2dd4bf', // Muted Teal
        color: '#0f172a', // Dark icon on light bg
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        border: '1px solid transparent', // Prevent layout shift on hover
        background: 'transparent',
        color: '#71717a',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    iconDivider: {
        width: '1px',
        height: '16px',
        backgroundColor: '#3f3f46',
        margin: '0 4px',
    },
    sendBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: 'transparent',
        border: '1px solid #3b82f6', // distinct blue
        color: '#3b82f6',
        fontSize: '14px',
        cursor: 'pointer',
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    bottomActions: {
        display: 'flex',
        gap: '16px',
    },
    actionBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        color: '#a1a1aa',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '20px',
        padding: '16px 24px',
        color: '#52525b',
        fontSize: '14px',
    },
    footerIcon: {
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    iconBtn: { // New style for footer/nav buttons
        background: 'transparent',
        border: 'none',
        color: '#71717a',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        borderRadius: '6px',
    }
};

export default BrowserArea;

