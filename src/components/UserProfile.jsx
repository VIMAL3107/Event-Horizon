import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Briefcase, GraduationCap, Zap, Settings,
    Plus, Trash2, Save, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import {
    loadProfile, saveProfile, loadCredentials, saveCredentials,
    addExperience, addEducation, parseSkills, getProfileCompletion
} from '../services/profileStorage';

const UserProfile = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [profile, setProfile] = useState(null);
    const [credentials, setCredentials] = useState({ linkedin: { email: '', password: '' } });
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // Load profile on mount
    useEffect(() => {
        if (isOpen) {
            setProfile(loadProfile());
            setCredentials(loadCredentials());
        }
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        const result = saveProfile(profile);
        saveCredentials(credentials);

        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus(result.success ? 'success' : 'error');
            setTimeout(() => setSaveStatus(null), 2000);
        }, 500);
    };

    const updateProfile = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const updatePreferences = (field, value) => {
        setProfile(prev => ({
            ...prev,
            preferences: { ...prev.preferences, [field]: value }
        }));
    };

    const handleAddExperience = () => {
        setProfile(prev => addExperience(prev, {
            company: '',
            title: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        }));
    };

    const handleAddEducation = () => {
        setProfile(prev => addEducation(prev, {
            school: '',
            degree: '',
            field: '',
            startYear: '',
            endYear: ''
        }));
    };

    const updateExperience = (id, field, value) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const deleteExperience = (id) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    const updateEducation = (id, field, value) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const deleteEducation = (id) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    if (!isOpen || !profile) return null;

    const tabs = [
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'skills', label: 'Skills', icon: Zap },
        { id: 'preferences', label: 'Preferences', icon: Settings },
    ];

    const completion = getProfileCompletion(profile);

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
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25 }}
                    style={styles.modal}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={styles.header}>
                        <div>
                            <h2 style={styles.title}>Your Profile</h2>
                            <p style={styles.subtitle}>Complete your profile for auto-fill</p>
                        </div>
                        <div style={styles.headerRight}>
                            <div style={styles.completion}>
                                <div style={styles.completionBar}>
                                    <motion.div
                                        style={{ ...styles.completionFill, width: `${completion}%` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completion}%` }}
                                    />
                                </div>
                                <span style={styles.completionText}>{completion}% complete</span>
                            </div>
                            <button style={styles.closeBtn} onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={styles.tabs}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === tab.id ? styles.tabActive : {})
                                }}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={styles.content}>
                        {activeTab === 'personal' && (
                            <div style={styles.section}>
                                <div style={styles.grid}>
                                    <InputField
                                        label="First Name"
                                        value={profile.firstName}
                                        onChange={v => updateProfile('firstName', v)}
                                        placeholder="John"
                                    />
                                    <InputField
                                        label="Last Name"
                                        value={profile.lastName}
                                        onChange={v => updateProfile('lastName', v)}
                                        placeholder="Doe"
                                    />
                                    <InputField
                                        label="Email"
                                        value={profile.email}
                                        onChange={v => updateProfile('email', v)}
                                        placeholder="john@example.com"
                                        type="email"
                                    />
                                    <InputField
                                        label="Phone"
                                        value={profile.phone}
                                        onChange={v => updateProfile('phone', v)}
                                        placeholder="+91 98765 43210"
                                    />
                                    <InputField
                                        label="Location"
                                        value={profile.location}
                                        onChange={v => updateProfile('location', v)}
                                        placeholder="Mumbai, India"
                                    />
                                    <InputField
                                        label="LinkedIn URL"
                                        value={profile.linkedInUrl}
                                        onChange={v => updateProfile('linkedInUrl', v)}
                                        placeholder="linkedin.com/in/username"
                                    />
                                </div>
                                <TextAreaField
                                    label="Professional Headline"
                                    value={profile.headline}
                                    onChange={v => updateProfile('headline', v)}
                                    placeholder="Senior Software Engineer | AI/ML Enthusiast"
                                    rows={2}
                                />
                                <TextAreaField
                                    label="Professional Summary"
                                    value={profile.summary}
                                    onChange={v => updateProfile('summary', v)}
                                    placeholder="Write a brief summary of your professional background..."
                                    rows={4}
                                />
                            </div>
                        )}

                        {activeTab === 'experience' && (
                            <div style={styles.section}>
                                {profile.experience.map((exp) => (
                                    <div key={exp.id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <Briefcase size={18} style={{ color: '#2dd4bf' }} />
                                            <button
                                                style={styles.deleteBtn}
                                                onClick={() => deleteExperience(exp.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div style={styles.grid}>
                                            <InputField
                                                label="Job Title"
                                                value={exp.title}
                                                onChange={v => updateExperience(exp.id, 'title', v)}
                                                placeholder="Software Engineer"
                                            />
                                            <InputField
                                                label="Company"
                                                value={exp.company}
                                                onChange={v => updateExperience(exp.id, 'company', v)}
                                                placeholder="Google"
                                            />
                                            <InputField
                                                label="Location"
                                                value={exp.location}
                                                onChange={v => updateExperience(exp.id, 'location', v)}
                                                placeholder="Bangalore, India"
                                            />
                                            <div style={styles.dateRow}>
                                                <InputField
                                                    label="Start Date"
                                                    value={exp.startDate}
                                                    onChange={v => updateExperience(exp.id, 'startDate', v)}
                                                    placeholder="Jan 2020"
                                                />
                                                <InputField
                                                    label="End Date"
                                                    value={exp.endDate}
                                                    onChange={v => updateExperience(exp.id, 'endDate', v)}
                                                    placeholder="Present"
                                                    disabled={exp.current}
                                                />
                                            </div>
                                        </div>
                                        <TextAreaField
                                            label="Description"
                                            value={exp.description}
                                            onChange={v => updateExperience(exp.id, 'description', v)}
                                            placeholder="Describe your responsibilities and achievements..."
                                            rows={3}
                                        />
                                    </div>
                                ))}
                                <button style={styles.addBtn} onClick={handleAddExperience}>
                                    <Plus size={18} />
                                    <span>Add Experience</span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'education' && (
                            <div style={styles.section}>
                                {profile.education.map((edu) => (
                                    <div key={edu.id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <GraduationCap size={18} style={{ color: '#2dd4bf' }} />
                                            <button
                                                style={styles.deleteBtn}
                                                onClick={() => deleteEducation(edu.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div style={styles.grid}>
                                            <InputField
                                                label="School/University"
                                                value={edu.school}
                                                onChange={v => updateEducation(edu.id, 'school', v)}
                                                placeholder="IIT Bombay"
                                            />
                                            <InputField
                                                label="Degree"
                                                value={edu.degree}
                                                onChange={v => updateEducation(edu.id, 'degree', v)}
                                                placeholder="Bachelor of Technology"
                                            />
                                            <InputField
                                                label="Field of Study"
                                                value={edu.field}
                                                onChange={v => updateEducation(edu.id, 'field', v)}
                                                placeholder="Computer Science"
                                            />
                                            <div style={styles.dateRow}>
                                                <InputField
                                                    label="Start Year"
                                                    value={edu.startYear}
                                                    onChange={v => updateEducation(edu.id, 'startYear', v)}
                                                    placeholder="2016"
                                                />
                                                <InputField
                                                    label="End Year"
                                                    value={edu.endYear}
                                                    onChange={v => updateEducation(edu.id, 'endYear', v)}
                                                    placeholder="2020"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button style={styles.addBtn} onClick={handleAddEducation}>
                                    <Plus size={18} />
                                    <span>Add Education</span>
                                </button>
                            </div>
                        )}

                        {activeTab === 'skills' && (
                            <div style={styles.section}>
                                <TextAreaField
                                    label="Skills (comma separated)"
                                    value={profile.skills.join(', ')}
                                    onChange={v => updateProfile('skills', parseSkills(v))}
                                    placeholder="JavaScript, React, Node.js, Python, Machine Learning, AWS..."
                                    rows={4}
                                />
                                <div style={styles.skillTags}>
                                    {profile.skills.map((skill, idx) => (
                                        <span key={idx} style={styles.skillTag}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <TextAreaField
                                    label="Resume Text (for AI matching)"
                                    value={profile.resumeText}
                                    onChange={v => updateProfile('resumeText', v)}
                                    placeholder="Paste your resume text here for better job matching..."
                                    rows={6}
                                />
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div style={styles.section}>
                                <div style={styles.grid}>
                                    <InputField
                                        label="Desired Role"
                                        value={profile.preferences.desiredRole}
                                        onChange={v => updatePreferences('desiredRole', v)}
                                        placeholder="Software Engineer, Full Stack Developer"
                                    />
                                    <InputField
                                        label="Expected Salary (LPA)"
                                        value={profile.preferences.desiredSalary}
                                        onChange={v => updatePreferences('desiredSalary', v)}
                                        placeholder="15-25 LPA"
                                    />
                                </div>
                                <div style={styles.fieldGroup}>
                                    <label style={styles.label}>Work Type</label>
                                    <div style={styles.radioGroup}>
                                        {['any', 'remote', 'hybrid', 'onsite'].map(type => (
                                            <button
                                                key={type}
                                                style={{
                                                    ...styles.radioBtn,
                                                    ...(profile.preferences.workType === type ? styles.radioBtnActive : {})
                                                }}
                                                onClick={() => updatePreferences('workType', type)}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <InputField
                                    label="Preferred Locations"
                                    value={profile.preferences.locations?.join(', ') || ''}
                                    onChange={v => updatePreferences('locations', v.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="Bangalore, Mumbai, Remote"
                                />

                                {/* LinkedIn Credentials */}
                                <div style={styles.credentialsSection}>
                                    <h3 style={styles.sectionTitle}>
                                        <Briefcase size={18} />
                                        LinkedIn Credentials
                                    </h3>
                                    <p style={styles.credentialsNote}>
                                        ⚠️ Stored locally for auto-login. Use at your own risk.
                                    </p>
                                    <div style={styles.grid}>
                                        <InputField
                                            label="LinkedIn Email"
                                            value={credentials.linkedin.email}
                                            onChange={v => setCredentials(prev => ({
                                                ...prev,
                                                linkedin: { ...prev.linkedin, email: v }
                                            }))}
                                            placeholder="your@email.com"
                                            type="email"
                                        />
                                        <InputField
                                            label="LinkedIn Password"
                                            value={credentials.linkedin.password}
                                            onChange={v => setCredentials(prev => ({
                                                ...prev,
                                                linkedin: { ...prev.linkedin, password: v }
                                            }))}
                                            placeholder="••••••••"
                                            type="password"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>
                        <button style={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            style={styles.saveBtn}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <span>Saving...</span>
                            ) : saveStatus === 'success' ? (
                                <>
                                    <CheckCircle size={18} />
                                    <span>Saved!</span>
                                </>
                            ) : saveStatus === 'error' ? (
                                <>
                                    <AlertCircle size={18} />
                                    <span>Error</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Save Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Input Field Component
const InputField = ({ label, value, onChange, placeholder, type = 'text', disabled }) => (
    <div style={styles.fieldGroup}>
        <label style={styles.label}>{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={styles.input}
        />
    </div>
);

// TextArea Field Component
const TextAreaField = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div style={styles.fieldGroup}>
        <label style={styles.label}>{label}</label>
        <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            style={styles.textarea}
        />
    </div>
);

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        backgroundColor: '#0a0a0a',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        padding: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    title: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#fff',
        margin: 0,
    },
    subtitle: {
        fontSize: '14px',
        color: '#71717a',
        margin: '4px 0 0 0',
    },
    completion: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    completionBar: {
        width: '100px',
        height: '6px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    completionFill: {
        height: '100%',
        backgroundColor: '#2dd4bf',
        borderRadius: '3px',
    },
    completionText: {
        fontSize: '12px',
        color: '#71717a',
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
    tabs: {
        display: 'flex',
        gap: '4px',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    tab: {
        padding: '12px 16px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#71717a',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid transparent',
        marginBottom: '-1px',
    },
    tabActive: {
        color: '#2dd4bf',
        borderBottom: '2px solid #2dd4bf',
    },
    content: {
        flex: 1,
        overflow: 'auto',
        padding: '24px',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#a1a1aa',
    },
    input: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    textarea: {
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
    },
    card: {
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '12px',
    },
    deleteBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: 'rgba(239,68,68,0.1)',
        color: '#ef4444',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateRow: {
        display: 'flex',
        gap: '12px',
        gridColumn: 'span 2',
    },
    addBtn: {
        padding: '12px 20px',
        borderRadius: '10px',
        border: '1px dashed rgba(255,255,255,0.2)',
        backgroundColor: 'transparent',
        color: '#71717a',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    skillTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '8px',
    },
    skillTag: {
        padding: '6px 12px',
        borderRadius: '20px',
        backgroundColor: 'rgba(45,212,191,0.1)',
        color: '#2dd4bf',
        fontSize: '13px',
    },
    radioGroup: {
        display: 'flex',
        gap: '8px',
    },
    radioBtn: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'transparent',
        color: '#71717a',
        fontSize: '13px',
        cursor: 'pointer',
    },
    radioBtnActive: {
        backgroundColor: 'rgba(45,212,191,0.1)',
        borderColor: '#2dd4bf',
        color: '#2dd4bf',
    },
    credentialsSection: {
        marginTop: '24px',
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: 'rgba(234,179,8,0.05)',
        border: '1px solid rgba(234,179,8,0.2)',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#fff',
        margin: '0 0 8px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    credentialsNote: {
        fontSize: '13px',
        color: '#eab308',
        marginBottom: '16px',
    },
    footer: {
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
    },
    cancelBtn: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'transparent',
        color: '#71717a',
        fontSize: '14px',
        cursor: 'pointer',
    },
    saveBtn: {
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#2dd4bf',
        color: '#0a0a0a',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
};

export default UserProfile;
