import React, { useState } from 'react';
import {
    ThumbsUp, ThumbsDown, Copy, Share2, RotateCw,
    Globe, ExternalLink, Image as ImageIcon, Sparkles,
    ChevronRight, Check, Search, Scissors, Lightbulb,
    Grid, Paperclip, Mic, ArrowUp, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const AIAnswerPage = ({ query, answer, sources, steps, isLoading, onFollowUp }) => {
    const [activeTab, setActiveTab] = useState('answer');
    const [copied, setCopied] = useState(false);
    const [followUpInput, setFollowUpInput] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(answer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFollowUp = () => {
        if (followUpInput.trim() && onFollowUp) {
            onFollowUp(followUpInput);
            setFollowUpInput('');
        }
    };

    const tabs = [
        { id: 'answer', label: 'Answer', icon: Sparkles },
        { id: 'links', label: 'Links', icon: Globe },
        { id: 'images', label: 'Images', icon: ImageIcon },
    ];

    return (
        <div style={styles.container}>
            {/* Centered Content Wrapper */}
            <div style={styles.centeredContainer}>
                {/* Tabs Bar */}
                <div style={styles.tabBar}>
                    <div style={styles.tabsLeft}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === tab.id ? styles.tabActive : {})
                                }}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={styles.tabsRight}>
                        <button style={styles.moreBtn}>
                            <MoreHorizontal size={16} />
                        </button>
                        <button style={styles.shareBtn}>
                            <Share2 size={14} />
                            Share
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div style={styles.mainContent}>
                    {/* Query Bubble - Right aligned */}
                    <motion.div
                        style={styles.querySection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={styles.queryBubble}>
                            {query}
                        </div>
                    </motion.div>

                    {/* Answer Area */}
                    <div style={styles.answerSection}>
                        {/* Steps indicator */}
                        {steps && steps.length > 0 && (
                            <div style={styles.stepsIndicator}>
                                <span style={styles.stepsText}>
                                    {steps.length} step{steps.length > 1 ? 's' : ''} completed
                                </span>
                                <ChevronRight size={14} style={{ opacity: 0.5 }} />
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading ? (
                            <div style={styles.loadingContainer}>
                                <RotateCw size={20} className="animate-spin" style={{ color: '#2dd4bf' }} />
                                <span style={styles.loadingText}>Searching and thinking...</span>
                            </div>
                        ) : (
                            <>
                                {/* Answer Content */}
                                <div style={styles.answerContent}>
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => <p style={styles.paragraph}>{children}</p>,
                                            h1: ({ children }) => <h1 style={styles.heading}>{children}</h1>,
                                            h2: ({ children }) => <h2 style={styles.heading}>{children}</h2>,
                                            code: ({ inline, children }) =>
                                                inline ? (
                                                    <code style={styles.inlineCode}>{children}</code>
                                                ) : (
                                                    <pre style={styles.codeBlock}><code>{children}</code></pre>
                                                ),
                                            a: ({ href, children }) => (
                                                <a href={href} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                                    {children}
                                                </a>
                                            ),
                                        }}
                                    >
                                        {answer || 'No answer yet.'}
                                    </ReactMarkdown>
                                </div>

                                {/* Action Icons Row */}
                                <div style={styles.actionRow}>
                                    <div style={styles.actionsLeft}>
                                        <button style={styles.actionIcon}><Share2 size={16} /></button>
                                        <button style={styles.actionIcon}><ArrowUp size={16} /></button>
                                        <button style={styles.actionIcon} onClick={handleCopy}>
                                            {copied ? <Check size={16} color="#2dd4bf" /> : <Copy size={16} />}
                                        </button>
                                        <button style={styles.actionIcon}><RotateCw size={16} /></button>
                                    </div>
                                    <div style={styles.actionsRight}>
                                        <button style={styles.actionIcon}><ThumbsUp size={16} /></button>
                                        <button style={styles.actionIcon}><ThumbsDown size={16} /></button>
                                        <button style={styles.actionIcon}><MoreHorizontal size={16} /></button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Follow-up Input - Fixed at bottom, centered */}
            <div style={styles.followUpWrapper}>
                <div style={styles.followUpContainer}>
                    <input
                        type="text"
                        value={followUpInput}
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                        placeholder="Ask a follow-up"
                        style={styles.followUpInput}
                    />
                    <div style={styles.inputActions}>
                        <div style={styles.inputActionsLeft}>
                            <button style={styles.inputIconActive}>
                                <Search size={14} />
                            </button>
                            <button style={styles.inputIcon}>
                                <Scissors size={14} />
                            </button>
                            <div style={styles.divider} />
                            <button style={styles.inputIcon}>
                                <Lightbulb size={14} />
                            </button>
                        </div>
                        <div style={styles.inputActionsRight}>
                            <button style={styles.inputIcon}><Grid size={14} /></button>
                            <button style={styles.inputIcon}><Paperclip size={14} /></button>
                            <button style={styles.inputIcon}><Mic size={14} /></button>
                            <button
                                style={styles.sendBtn}
                                onClick={handleFollowUp}
                                disabled={!followUpInput.trim()}
                            >
                                <ArrowUp size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0b',
        color: '#e4e4e7',
        fontFamily: '"Inter", sans-serif',
        height: '100%',
        overflow: 'hidden',
    },
    centeredContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
        overflowY: 'auto',
    },
    tabBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    tabsLeft: {
        display: 'flex',
        gap: '4px',
    },
    tabsRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '14px 12px',
        background: 'transparent',
        border: 'none',
        color: '#71717a',
        fontSize: '13px',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s',
    },
    tabActive: {
        color: '#e4e4e7',
        borderBottomColor: '#2dd4bf',
    },
    moreBtn: {
        background: 'transparent',
        border: 'none',
        color: '#71717a',
        cursor: 'pointer',
        padding: '6px',
    },
    shareBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: '#2dd4bf',
        border: 'none',
        borderRadius: '8px',
        color: '#0f172a',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    mainContent: {
        flex: 1,
        padding: '24px 16px',
    },
    querySection: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '24px',
    },
    queryBubble: {
        backgroundColor: '#2dd4bf',
        color: '#0f172a',
        padding: '10px 18px',
        borderRadius: '18px',
        fontSize: '14px',
        fontWeight: '500',
    },
    answerSection: {
        paddingLeft: '0',
    },
    stepsIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '12px',
        color: '#2dd4bf',
        fontSize: '13px',
    },
    stepsText: {
        fontWeight: '500',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 0',
    },
    loadingText: {
        color: '#a1a1aa',
        fontSize: '14px',
    },
    answerContent: {
        lineHeight: '1.7',
    },
    paragraph: {
        marginBottom: '12px',
        fontSize: '15px',
        color: '#d4d4d8',
    },
    heading: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#f4f4f5',
    },
    inlineCode: {
        backgroundColor: '#27272a',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '13px',
    },
    codeBlock: {
        backgroundColor: '#18181b',
        padding: '12px',
        borderRadius: '8px',
        overflow: 'auto',
        marginBottom: '12px',
        fontSize: '13px',
    },
    link: {
        color: '#2dd4bf',
        textDecoration: 'none',
    },
    actionRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
        paddingTop: '12px',
    },
    actionsLeft: {
        display: 'flex',
        gap: '4px',
    },
    actionsRight: {
        display: 'flex',
        gap: '4px',
    },
    actionIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        color: '#52525b',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    followUpWrapper: {
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
    },
    followUpContainer: {
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#18181b',
        borderRadius: '16px',
        padding: '12px 16px',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    followUpInput: {
        width: '100%',
        background: 'transparent',
        border: 'none',
        color: '#e4e4e7',
        fontSize: '14px',
        outline: 'none',
        marginBottom: '12px',
    },
    inputActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inputActionsLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    inputActionsRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    inputIconActive: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: 'none',
        background: '#2dd4bf',
        color: '#0f172a',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputIcon: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: 'none',
        background: 'transparent',
        color: '#52525b',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: '1px',
        height: '16px',
        backgroundColor: '#3f3f46',
        margin: '0 4px',
    },
    sendBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: '1px solid #3f3f46',
        background: 'transparent',
        color: '#52525b',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default AIAnswerPage;
