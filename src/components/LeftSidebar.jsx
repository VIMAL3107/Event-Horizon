import React, { useState } from 'react';
import {
    Library, Compass, LayoutGrid, Wallet, MoreHorizontal,
    Bell, Sparkles, Plus, Briefcase, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';
import JobAutomation from './JobAutomation';
import LoginButton from './LoginButton';

const LeftSidebar = ({ onNewTab, onNavigate }) => {
    const { isAuthenticated, user } = useAuth();
    const [activeNav, setActiveNav] = useState('Spaces');
    const [showProfile, setShowProfile] = useState(false);
    const [showAutomation, setShowAutomation] = useState(false);

    const alertNotImplemented = (feature) => {
        console.log(`Feature not yet implemented: ${feature}`);
    };

    const navItems = [
        { icon: Library, label: 'Library', id: 'Library' },
        { icon: Compass, label: 'Discover', id: 'Discover' },
        { icon: LayoutGrid, label: 'Spaces', id: 'Spaces' },
        { icon: Briefcase, label: 'Jobs', id: 'Jobs', action: () => setShowAutomation(true) },
        { icon: MoreHorizontal, label: 'More', id: 'More' },
    ];

    return (
        <aside style={{
            ...styles.sidebar,
            backgroundColor: isAuthenticated ? '#09090b' : 'transparent',
            borderRight: isAuthenticated ? '1px solid rgba(255,255,255,0.08)' : 'none'
        }}>
            {/* Logo */}
            <motion.div
                style={styles.logo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2dd4bf" fillOpacity="0.2" />
                    <path d="M2 17L12 22L22 17" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </motion.div>

            {isAuthenticated ? (
                <>
                    {/* Add Button */}
                    <motion.button
                        style={styles.addBtn}
                        onClick={onNewTab}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)' }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus size={20} strokeWidth={1.5} />
                    </motion.button>

                    {/* Main Navigation */}
                    <nav style={styles.nav}>
                        {navItems.map((item) => {
                            const isActive = activeNav === item.id;
                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveNav(item.id);
                                        if (item.action) item.action();
                                    }}
                                    style={styles.navItem}
                                    whileHover={{ scale: 1.05 }}
                                    animate={{
                                        color: isActive ? '#e4e4e7' : '#71717a',
                                    }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavBackground"
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: '10px',
                                                backgroundColor: 'rgba(255,255,255,0.08)',
                                                zIndex: 0
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon
                                        size={22}
                                        strokeWidth={1.5}
                                        style={{
                                            zIndex: 1,
                                            position: 'relative'
                                        }}
                                    />
                                    <span style={{ fontSize: '10px', marginTop: '4px', zIndex: 1, position: 'relative' }}>{item.label}</span>
                                </motion.button>
                            );
                        })}
                    </nav>

                    {/* Bottom Items */}
                    <div style={styles.bottomSection}>
                        <button style={styles.navItem} onClick={() => alertNotImplemented('Notifications')}>
                            <Bell size={22} strokeWidth={1.5} />
                        </button>
                        <button style={styles.accountBtn} onClick={() => setShowProfile(true)}>
                            <div style={{ ...styles.avatar, backgroundImage: user ? `url(${user.avatar})` : 'none', backgroundSize: 'cover' }}>
                                {!user && <User size={16} />}
                            </div>
                            <span style={styles.navLabel}>Profile</span>
                        </button>
                        <button style={styles.upgradeBtn} onClick={() => alertNotImplemented('Upgrade')}>
                            <Sparkles size={22} strokeWidth={1.5} style={{ color: '#ef4444' }} />
                            <span style={styles.navLabel}>Upgrade</span>
                        </button>
                    </div>
                </>
            ) : (
                <div style={{ padding: '20px' }}>
                    <LoginButton />
                </div>
            )}

            {/* Modals */}
            <UserProfile
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
            />
            <JobAutomation
                isOpen={showAutomation}
                onClose={() => setShowAutomation(false)}
                onNavigate={onNavigate}
            />
        </aside>
    );
};

const styles = {
    sidebar: {
        width: '72px',
        backgroundColor: '#09090b',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        height: '100vh',
        fontFamily: '"Inter", sans-serif',
        zIndex: 50,
    },
    logo: {
        marginBottom: '28px',
        opacity: 0.9,
    },
    addBtn: {
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        color: '#e4e4e7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginBottom: '32px',
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        alignItems: 'center',
        flex: 1,
    },
    navItem: {
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#71717a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
    },
    bottomSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        marginTop: 'auto',
        width: '100%',
    },
    accountBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#71717a',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#2dd4bf',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600',
        color: '#0f172a',
        border: '2px solid rgba(0,0,0,0.2)',
    },
    upgradeBtn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        marginTop: '8px',
        color: '#71717a',
    },
    navLabel: {
        fontSize: '10px',
        fontWeight: '500',
    }
};

export default LeftSidebar;
