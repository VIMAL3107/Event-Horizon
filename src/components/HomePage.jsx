import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chrome, ArrowRight, Shield, Zap, Globe, User, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HomePage = ({ onNavigate }) => {
    const { login } = useAuth();
    const [isHovering, setIsHovering] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const [showAccountChooser, setShowAccountChooser] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLoginClick = () => {
        setIsLoggingIn(true);
        login();
    };

    const handleAccountSelect = (account) => {
        setShowAccountChooser(false);
        // Simulate short delay before consent
        setTimeout(() => {
            setShowConsent(true);
        }, 300);
    };

    const handleConsentAllow = () => {
        setShowConsent(false);
        login();
    };

    return (
        <div style={styles.container}>
            {/* Background Effects */}
            <div style={styles.background}>
                <div style={styles.gradientOrb} />
                <div style={styles.gridOverlay} />
            </div>

            {/* Account Chooser Modal Removed - using real Google Login */}
            {/* Consent Modal Overlay Removed - using real Google Login */}

            {/* Main Hero */}
            <div style={{ ...styles.content, filter: (showConsent || showAccountChooser) ? 'blur(5px)' : 'none', transition: 'filter 0.3s' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={styles.heroSection}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        style={styles.logoBadge}
                    >
                        <span style={styles.logoBadgeText}>New: Comet 2.0 Available</span>
                    </motion.div>

                    <h1 style={styles.title}>
                        <span style={styles.textGradient}>Experience the future</span>
                        <br />
                        <span>of browsing.</span>
                    </h1>

                    <p style={styles.subtitle}>
                        Event Horizon combines a powerful browser with an intelligent AI assistant.
                        Sign in to access personalized search, voice control, and automation.
                    </p>

                    <div style={styles.actions}>
                        <motion.button
                            style={{ ...styles.loginBtn, opacity: isLoggingIn ? 0.8 : 1 }}
                            onClick={handleLoginClick}
                            disabled={isLoggingIn}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onHoverStart={() => setIsHovering(true)}
                            onHoverEnd={() => setIsHovering(false)}
                        >
                            {isLoggingIn ? (
                                <div className="animate-spin" style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #000', borderTopColor: 'transparent' }} />
                            ) : (
                                <Chrome size={20} />
                            )}
                            <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                            {!isLoggingIn && isHovering && <ArrowRight size={16} style={{ marginLeft: '4px' }} />}
                        </motion.button>

                        <p style={styles.disclaimer}>
                            By signing in, you verify that you are a real user.
                        </p>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    style={styles.features}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                >
                    <FeatureCard
                        icon={Zap}
                        title="AI-Powered"
                        desc="Advanced AI answers and summaries."
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Private & Secure"
                        desc="Built-in ad blocking and tracking protection."
                    />
                    <FeatureCard
                        icon={Globe}
                        title="Universal Access"
                        desc="Access the entire web with intelligent context."
                    />
                </motion.div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div style={styles.card}>
        <div style={styles.cardIcon}>
            <Icon size={20} color="#2dd4bf" />
        </div>
        <div>
            <h3 style={styles.cardTitle}>{title}</h3>
            <p style={styles.cardDesc}>{desc}</p>
        </div>
    </div>
);

const styles = {
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000000',
        fontFamily: '"Outfit", sans-serif',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
    },
    gradientOrb: {
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(60px)',
    },
    gridOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
    },
    content: {
        position: 'relative',
        zIndex: 1,
        maxWidth: '1000px',
        width: '100%',
        padding: '0 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    heroSection: {
        marginBottom: '64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    logoBadge: {
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        border: '1px solid rgba(45, 212, 191, 0.2)',
        borderRadius: '20px',
        padding: '6px 16px',
        marginBottom: '32px',
        display: 'inline-block',
    },
    logoBadgeText: {
        color: '#2dd4bf',
        fontSize: '13px',
        fontWeight: '500',
    },
    title: {
        fontSize: '64px',
        fontWeight: '600',
        lineHeight: '1.1',
        marginBottom: '24px',
        color: '#ffffff',
        letterSpacing: '-0.03em',
    },
    textGradient: {
        background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '18px',
        color: '#94a3b8',
        maxWidth: '600px',
        lineHeight: '1.6',
        marginBottom: '40px',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    },
    loginBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        borderRadius: '12px',
        padding: '16px 32px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)',
        transition: 'all 0.2s',
    },
    disclaimer: {
        fontSize: '13px',
        color: '#52525b',
    },
    features: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        width: '100%',
        maxWidth: '900px',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'left',
        transition: 'transform 0.2s',
    },
    cardIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#f4f4f5',
        marginBottom: '4px',
    },
    cardDesc: {
        fontSize: '14px',
        color: '#a1a1aa',
        lineHeight: '1.5',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    consentCard: {
        width: '400px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        textAlign: 'left',
        color: '#202124',
    },
    googleHeader: {
        padding: '16px 24px',
        borderBottom: '1px solid #dadce0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    googleTitle: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#3c4043',
    },
    consentBody: {
        padding: '24px',
    },
    consentHeading: {
        fontSize: '22px',
        fontWeight: '400',
        marginBottom: '16px',
        color: '#202124',
        textAlign: 'center',
    },
    accountList: {
        display: 'flex',
        flexDirection: 'column',
    },
    accountItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 0',
        borderBottom: '1px solid #f1f3f4',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    accountAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#a78bfa',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
    },
    accountInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    accountName: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#3c4043',
    },
    accountEmail: {
        fontSize: '12px',
        color: '#5f6368',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px',
        padding: '8px',
        border: '1px solid #dadce0',
        borderRadius: '16px',
        width: 'fit-content',
        margin: '0 auto 24px',
        paddingLeft: '32px',
        paddingRight: '32px',
        position: 'relative',
    },
    userAvatarStub: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: '#a78bfa',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        position: 'absolute',
        left: '6px',
        top: '50%',
        transform: 'translateY(-50%)',
    },
    userEmailStub: {
        fontSize: '14px',
        color: '#3c4043',
        fontWeight: '500',
    },
    consentText: {
        fontSize: '14px',
        marginBottom: '16px',
        color: '#5f6368',
    },
    permissionList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 24px 0',
    },
    permissionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 0',
        fontSize: '14px',
        color: '#3c4043',
    },
    checkIcon: {
        color: '#1a73e8',
        fontSize: '16px',
        fontWeight: 'bold',
    },
    consentPolicy: {
        fontSize: '12px',
        color: '#5f6368',
        lineHeight: '1.4',
    },
    consentFooter: {
        padding: '16px 24px',
        borderTop: '1px solid #dadce0', // Google style border
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        backgroundColor: '#f8f9fa',
    },
    allowBtn: {
        backgroundColor: '#1a73e8',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 24px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    denyBtn: {
        backgroundColor: 'transparent',
        color: '#1a73e8',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 24px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
};

export default HomePage;
