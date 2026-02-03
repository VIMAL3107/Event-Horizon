import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Play, Pause, Settings, Briefcase, MapPin, Search,
    CheckCircle, XCircle, Clock, ExternalLink, RefreshCw,
    Zap, Target, TrendingUp, AlertTriangle, FileText
} from 'lucide-react';
import { loadProfile } from '../services/profileStorage';
import automationBridge from '../services/automationBridge';

const JobAutomation = ({ isOpen, onClose, onNavigate }) => {
    const [profile, setProfile] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('assist'); // 'auto' or 'assist'
    const [status, setStatus] = useState('idle');
    const [currentJob, setCurrentJob] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [foundJobs, setFoundJobs] = useState([]);
    const [searchSettings, setSearchSettings] = useState({
        keywords: '',
        location: '',
        remote: false,
        easyApplyOnly: true,
        experienceLevel: 'any',
    });
    const [logs, setLogs] = useState([]);
    const automationInterval = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const loadedProfile = loadProfile();
            setProfile(loadedProfile);
            // Pre-fill from preferences
            if (loadedProfile?.preferences) {
                setSearchSettings(prev => ({
                    ...prev,
                    keywords: loadedProfile.preferences.desiredRole || '',
                    location: loadedProfile.preferences.locations?.[0] || '',
                    remote: loadedProfile.preferences.workType === 'remote',
                }));
            }
        }

        // Cleanup interval on unmount
        return () => {
            if (automationInterval.current) {
                clearInterval(automationInterval.current);
            }
        };
    }, [isOpen]);

    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, {
            id: Date.now(),
            message,
            type,
            time: new Date().toLocaleTimeString(),
        }]);
    };

    const startAutomation = async () => {
        if (!profile || !profile.firstName) {
            addLog('Please complete your profile first!', 'error');
            return;
        }

        setIsRunning(true);
        setStatus('starting');
        addLog('Starting job automation...', 'info');

        // Navigate to LinkedIn Jobs
        const linkedInJobsUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchSettings.keywords)}&location=${encodeURIComponent(searchSettings.location)}${searchSettings.easyApplyOnly ? '&f_AL=true' : ''}${searchSettings.remote ? '&f_WT=2' : ''}`;

        addLog(`Opening LinkedIn Jobs: ${searchSettings.keywords}`, 'info');

        if (onNavigate) {
            onNavigate(linkedInJobsUrl);
        }

        setStatus('searching');
        addLog('Navigating to LinkedIn Jobs...', 'info');

        // Wait for page to load, then start scanning for jobs
        setTimeout(async () => {
            await scanForJobs();
        }, 5000);
    };

    const scanForJobs = async () => {
        if (!automationBridge.isAvailable()) {
            addLog('Webview not ready. Please wait...', 'warning');
            setTimeout(scanForJobs, 2000);
            return;
        }

        try {
            addLog('Scanning page for job listings...', 'info');
            const jobs = await automationBridge.getLinkedInJobListings();

            if (jobs && jobs.length > 0) {
                setFoundJobs(jobs);
                addLog(`Found ${jobs.length} job listings!`, 'success');
                setStatus('found');
            } else {
                addLog('No job listings found yet. Waiting...', 'warning');
                // Retry after a delay
                setTimeout(scanForJobs, 3000);
            }
        } catch (error) {
            addLog(`Error scanning: ${error.message}`, 'error');
            setStatus('error');
        }
    };

    const fillApplicationForm = async () => {
        if (!automationBridge.isAvailable()) {
            addLog('Cannot fill form - webview not ready', 'error');
            return;
        }

        addLog('Detecting form fields...', 'info');

        try {
            const fields = await automationBridge.getFormFields();
            addLog(`Found ${fields.length} form fields`, 'info');

            // Map profile data to form fields
            for (const field of fields) {
                let value = null;
                const label = field.label.toLowerCase();

                // Smart mapping based on field labels
                if (label.includes('first') && label.includes('name')) {
                    value = profile.firstName;
                } else if (label.includes('last') && label.includes('name')) {
                    value = profile.lastName;
                } else if (label.includes('email')) {
                    value = profile.email;
                } else if (label.includes('phone') || label.includes('mobile')) {
                    value = profile.phone;
                } else if (label.includes('linkedin')) {
                    value = profile.linkedInUrl;
                } else if (label.includes('location') || label.includes('city')) {
                    value = profile.location;
                }

                if (value && field.selector) {
                    await automationBridge.fillField(field.selector, value);
                    addLog(`Filled: ${field.label}`, 'success');
                }
            }

            addLog('Form auto-fill complete! Please review and submit.', 'success');
        } catch (error) {
            addLog(`Error filling form: ${error.message}`, 'error');
        }
    };

    const handleApplyToJob = async (job) => {
        setCurrentJob(job);
        addLog(`Selecting job: ${job.title} at ${job.company}`, 'info');

        // In a real implementation, we would click on the job card to open details
        // Then click Easy Apply and fill the form

        if (mode === 'auto') {
            addLog('Auto mode: Would click Easy Apply and fill form', 'info');
        } else {
            addLog('Assist mode: Ready to help fill the application form', 'info');
        }
    };

    const stopAutomation = () => {
        setIsRunning(false);
        setStatus('stopped');
        addLog('Automation stopped by user', 'warning');
    };

    const handleApplyClick = (job) => {
        if (mode === 'auto') {
            addLog(`Auto-applying to: ${job.title} at ${job.company}`, 'info');
            // Auto-fill and submit
        } else {
            addLog(`Ready to apply: ${job.title} at ${job.company}. Review and submit.`, 'info');
            // Just fill the form, don't submit
        }
    };

    const profileComplete = profile && profile.firstName && profile.email;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.overlay}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ type: 'spring', damping: 25 }}
                    style={styles.panel}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.headerTitle}>
                            <Zap size={22} style={{ color: '#2dd4bf' }} />
                            <div>
                                <h2 style={styles.title}>Job Automation</h2>
                                <p style={styles.subtitle}>
                                    {isRunning ? `Status: ${status}` : 'Ready to start'}
                                </p>
                            </div>
                        </div>
                        <button style={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Profile Alert */}
                    {!profileComplete && (
                        <div style={styles.alert}>
                            <AlertTriangle size={18} />
                            <span>Complete your profile for auto-fill to work!</span>
                        </div>
                    )}

                    {/* Mode Toggle */}
                    <div style={styles.modeSection}>
                        <span style={styles.modeLabel}>Apply Mode:</span>
                        <div style={styles.modeToggle}>
                            <button
                                style={{
                                    ...styles.modeBtn,
                                    ...(mode === 'assist' ? styles.modeBtnActive : {})
                                }}
                                onClick={() => setMode('assist')}
                            >
                                <Target size={16} />
                                Assist
                            </button>
                            <button
                                style={{
                                    ...styles.modeBtn,
                                    ...(mode === 'auto' ? styles.modeBtnActive : {})
                                }}
                                onClick={() => setMode('auto')}
                            >
                                <Zap size={16} />
                                Auto
                            </button>
                        </div>
                        <p style={styles.modeDescription}>
                            {mode === 'assist'
                                ? 'Fills forms, waits for you to review & submit'
                                : 'Fully automatic - applies without confirmation'}
                        </p>
                    </div>

                    {/* Search Settings */}
                    <div style={styles.searchSection}>
                        <h3 style={styles.sectionTitle}>
                            <Search size={16} />
                            Search Filters
                        </h3>
                        <div style={styles.searchFields}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Keywords / Job Title</label>
                                <input
                                    type="text"
                                    value={searchSettings.keywords}
                                    onChange={e => setSearchSettings(prev => ({ ...prev, keywords: e.target.value }))}
                                    placeholder="Software Engineer, React Developer..."
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Location</label>
                                <input
                                    type="text"
                                    value={searchSettings.location}
                                    onChange={e => setSearchSettings(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="Bangalore, India"
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.checkboxRow}>
                                <label style={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={searchSettings.easyApplyOnly}
                                        onChange={e => setSearchSettings(prev => ({ ...prev, easyApplyOnly: e.target.checked }))}
                                    />
                                    <span>Easy Apply only</span>
                                </label>
                                <label style={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={searchSettings.remote}
                                        onChange={e => setSearchSettings(prev => ({ ...prev, remote: e.target.checked }))}
                                    />
                                    <span>Remote jobs</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div style={styles.controlSection}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {!isRunning ? (
                                <button
                                    style={styles.startBtn}
                                    onClick={startAutomation}
                                    disabled={!profileComplete}
                                >
                                    <Play size={20} />
                                    <span>Start Automation</span>
                                </button>
                            ) : (
                                <button style={styles.stopBtn} onClick={stopAutomation}>
                                    <Pause size={20} />
                                    <span>Stop</span>
                                </button>
                            )}
                        </div>
                        <button
                            style={styles.fillBtn}
                            onClick={fillApplicationForm}
                            disabled={!profileComplete}
                        >
                            <FileText size={18} />
                            <span>Fill Current Form</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={styles.statsRow}>
                        <div style={styles.stat}>
                            <CheckCircle size={18} style={{ color: '#22c55e' }} />
                            <span style={styles.statValue}>{appliedJobs.filter(j => j.status === 'applied').length}</span>
                            <span style={styles.statLabel}>Applied</span>
                        </div>
                        <div style={styles.stat}>
                            <Clock size={18} style={{ color: '#eab308' }} />
                            <span style={styles.statValue}>{appliedJobs.filter(j => j.status === 'pending').length}</span>
                            <span style={styles.statLabel}>Pending</span>
                        </div>
                        <div style={styles.stat}>
                            <XCircle size={18} style={{ color: '#ef4444' }} />
                            <span style={styles.statValue}>{appliedJobs.filter(j => j.status === 'skipped').length}</span>
                            <span style={styles.statLabel}>Skipped</span>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div style={styles.logSection}>
                        <h3 style={styles.sectionTitle}>
                            <RefreshCw size={16} />
                            Activity Log
                        </h3>
                        <div style={styles.logList}>
                            {logs.length === 0 ? (
                                <p style={styles.emptyLog}>No activity yet. Start automation to see logs.</p>
                            ) : (
                                logs.slice(-10).reverse().map(log => (
                                    <div key={log.id} style={{
                                        ...styles.logItem,
                                        borderLeftColor: log.type === 'error' ? '#ef4444' :
                                            log.type === 'success' ? '#22c55e' :
                                                log.type === 'warning' ? '#eab308' : '#71717a'
                                    }}>
                                        <span style={styles.logTime}>{log.time}</span>
                                        <span style={styles.logMessage}>{log.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Applied Jobs List */}
                    {appliedJobs.length > 0 && (
                        <div style={styles.jobsSection}>
                            <h3 style={styles.sectionTitle}>
                                <Briefcase size={16} />
                                Recent Applications
                            </h3>
                            <div style={styles.jobsList}>
                                {appliedJobs.slice(-5).map(job => (
                                    <div key={job.id} style={styles.jobCard}>
                                        <div style={styles.jobInfo}>
                                            <span style={styles.jobTitle}>{job.title}</span>
                                            <span style={styles.jobCompany}>{job.company}</span>
                                        </div>
                                        <div style={styles.jobStatus}>
                                            {job.status === 'applied' && <CheckCircle size={16} style={{ color: '#22c55e' }} />}
                                            {job.status === 'pending' && <Clock size={16} style={{ color: '#eab308' }} />}
                                            {job.status === 'skipped' && <XCircle size={16} style={{ color: '#ef4444' }} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1000,
    },
    panel: {
        width: '420px',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    title: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#fff',
        margin: 0,
    },
    subtitle: {
        fontSize: '13px',
        color: '#71717a',
        margin: 0,
    },
    closeBtn: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#71717a',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    alert: {
        margin: '16px 20px 0',
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#ef4444',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    modeSection: {
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    modeLabel: {
        fontSize: '13px',
        color: '#a1a1aa',
        marginBottom: '8px',
        display: 'block',
    },
    modeToggle: {
        display: 'flex',
        gap: '8px',
        marginBottom: '8px',
    },
    modeBtn: {
        flex: 1,
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'transparent',
        color: '#71717a',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    modeBtnActive: {
        backgroundColor: 'rgba(45,212,191,0.1)',
        borderColor: '#2dd4bf',
        color: '#2dd4bf',
    },
    modeDescription: {
        fontSize: '12px',
        color: '#71717a',
        margin: 0,
    },
    searchSection: {
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#e4e4e7',
        margin: '0 0 12px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    searchFields: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '12px',
        color: '#a1a1aa',
    },
    input: {
        padding: '10px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
    },
    checkboxRow: {
        display: 'flex',
        gap: '16px',
    },
    checkbox: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#a1a1aa',
        cursor: 'pointer',
    },
    controlSection: {
        padding: '20px',
    },
    startBtn: {
        width: '100%',
        padding: '14px 20px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
        color: '#0a0a0a',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    stopBtn: {
        width: '100%',
        padding: '14px 20px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#ef4444',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    fillBtn: {
        width: '100%',
        padding: '12px 20px',
        borderRadius: '10px',
        border: '1px solid rgba(45,212,191,0.3)',
        backgroundColor: 'rgba(45,212,191,0.1)',
        color: '#2dd4bf',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '10px',
    },
    statsRow: {
        display: 'flex',
        gap: '12px',
        padding: '0 20px 20px',
    },
    stat: {
        flex: 1,
        padding: '12px',
        borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
    },
    statValue: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#fff',
    },
    statLabel: {
        fontSize: '11px',
        color: '#71717a',
    },
    logSection: {
        flex: 1,
        padding: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    logList: {
        flex: 1,
        overflow: 'auto',
    },
    emptyLog: {
        fontSize: '13px',
        color: '#52525b',
        textAlign: 'center',
        padding: '20px',
    },
    logItem: {
        padding: '8px 12px',
        marginBottom: '6px',
        borderRadius: '6px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderLeft: '3px solid #71717a',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
    logTime: {
        fontSize: '11px',
        color: '#52525b',
        minWidth: '65px',
    },
    logMessage: {
        fontSize: '13px',
        color: '#a1a1aa',
    },
    jobsSection: {
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
    },
    jobsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    jobCard: {
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    jobInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    jobTitle: {
        fontSize: '14px',
        color: '#fff',
        fontWeight: '500',
    },
    jobCompany: {
        fontSize: '12px',
        color: '#71717a',
    },
    jobStatus: {
        display: 'flex',
        alignItems: 'center',
    },
};

export default JobAutomation;
