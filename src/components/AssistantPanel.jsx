import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Mic, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const AssistantPanel = ({ onClose, pageContent, pageUrl }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Voice Recognition
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            // Auto-submit after voice input
            handleAsk(transcript);
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    // Ask Assistant
    const handleAsk = async (q = question) => {
        if (!q.trim()) return;
        setIsLoading(true);
        setAnswer('');

        try {
            const result = await api.ask(pageContent || '', q);
            setAnswer(result.answer || 'No answer received.');
        } catch (err) {
            setAnswer(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    };

    return (
        <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={styles.panel}
        >
            {/* Header */}
            <div style={styles.header}>
                <button style={styles.closeBtn} onClick={onClose}>
                    <X size={16} />
                </button>
            </div>

            {/* Logo and Title */}
            <div style={styles.logoSection}>
                <div style={styles.logoIcon}>
                    <Sparkles size={32} color="#2dd4bf" />
                </div>
                <h2 style={styles.title}>Assistant</h2>
                <p style={styles.description}>
                    Comet Assistant uses the current page and relevant browser
                    history to provide answers to your questions. <span style={styles.learnMore}>Learn more</span>
                </p>
            </div>

            {/* Answer Area */}
            {answer && (
                <div style={styles.answerArea}>
                    <div style={styles.answerText}>{answer}</div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div style={styles.loadingArea}>
                    <div style={styles.loadingDot} />
                    <span>Thinking...</span>
                </div>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Input Section */}
            <div style={styles.inputSection}>
                <div style={styles.brandLabel}>
                    <Sparkles size={12} color="#2dd4bf" />
                    <span>Perplexity</span>
                </div>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    style={styles.input}
                />
                <div style={styles.inputActions}>
                    <button style={styles.addBtn}>
                        <Plus size={14} />
                    </button>
                    <button
                        style={{
                            ...styles.voiceBtn,
                            ...(isListening ? styles.voiceBtnActive : {})
                        }}
                        onClick={isListening ? stopListening : startListening}
                    >
                        <Mic size={14} />
                    </button>
                </div>
            </div>

            {/* Page Context Indicator */}
            {pageUrl && (
                <div style={styles.contextBar}>
                    <span style={styles.contextLabel}>Context:</span>
                    <span style={styles.contextUrl}>{new URL(pageUrl).hostname}</span>
                </div>
            )}
        </motion.div>
    );
};

const styles = {
    panel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '360px',
        backgroundColor: '#0f0f10',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"Inter", sans-serif',
        zIndex: 100,
    },
    header: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '12px 16px',
    },
    closeBtn: {
        background: 'transparent',
        border: 'none',
        color: '#71717a',
        cursor: 'pointer',
        padding: '4px',
    },
    logoSection: {
        textAlign: 'center',
        padding: '40px 24px',
    },
    logoIcon: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
    },
    title: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#e4e4e7',
        marginBottom: '12px',
    },
    description: {
        fontSize: '13px',
        color: '#71717a',
        lineHeight: '1.5',
    },
    learnMore: {
        color: '#2dd4bf',
        cursor: 'pointer',
    },
    answerArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
    },
    answerText: {
        fontSize: '14px',
        color: '#d4d4d8',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
    },
    loadingArea: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 24px',
        color: '#71717a',
        fontSize: '13px',
    },
    loadingDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#2dd4bf',
        animation: 'pulse 1.5s infinite',
    },
    inputSection: {
        margin: '0 16px 16px',
        backgroundColor: '#18181b',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    brandLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#71717a',
        marginBottom: '8px',
    },
    input: {
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
    addBtn: {
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
    voiceBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        border: 'none',
        background: '#2dd4bf',
        color: '#0f172a',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    voiceBtnActive: {
        background: '#f43f5e',
        animation: 'pulse 1s infinite',
    },
    contextBar: {
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
    },
    contextLabel: {
        color: '#52525b',
    },
    contextUrl: {
        color: '#a1a1aa',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
};

export default AssistantPanel;
