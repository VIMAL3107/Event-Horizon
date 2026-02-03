// Profile Storage Service
// Handles saving and loading user profile data for job automation

const STORAGE_KEY = 'comet_user_profile';
const CREDENTIALS_KEY = 'comet_credentials';

// Default empty profile structure
const defaultProfile = {
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedInUrl: '',
    portfolioUrl: '',

    // Professional Summary
    headline: '',
    summary: '',

    // Work Experience (array)
    experience: [],

    // Education (array)
    education: [],

    // Skills (array of strings)
    skills: [],

    // Job Preferences
    preferences: {
        desiredRole: '',
        desiredSalary: '',
        workType: 'any', // remote, hybrid, onsite, any
        locations: [],
        willingToRelocate: false,
    },

    // Resume
    resumeText: '', // Parsed resume text for AI matching

    // Metadata
    lastUpdated: null,
};

// Save profile to localStorage
export function saveProfile(profile) {
    try {
        const updatedProfile = {
            ...profile,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
        return { success: true };
    } catch (error) {
        console.error('Failed to save profile:', error);
        return { success: false, error: error.message };
    }
}

// Load profile from localStorage
export function loadProfile() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return { ...defaultProfile };
    } catch (error) {
        console.error('Failed to load profile:', error);
        return { ...defaultProfile };
    }
}

// Save credentials (separate for security consideration)
export function saveCredentials(credentials) {
    try {
        // In production, use electron-store with encryption
        // For now, using base64 encoding (not secure, just obfuscation)
        const encoded = btoa(JSON.stringify(credentials));
        localStorage.setItem(CREDENTIALS_KEY, encoded);
        return { success: true };
    } catch (error) {
        console.error('Failed to save credentials:', error);
        return { success: false, error: error.message };
    }
}

// Load credentials
export function loadCredentials() {
    try {
        const stored = localStorage.getItem(CREDENTIALS_KEY);
        if (stored) {
            return JSON.parse(atob(stored));
        }
        return { linkedin: { email: '', password: '' } };
    } catch (error) {
        console.error('Failed to load credentials:', error);
        return { linkedin: { email: '', password: '' } };
    }
}

// Clear all data
export function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CREDENTIALS_KEY);
}

// Add work experience entry
export function addExperience(profile, experience) {
    return {
        ...profile,
        experience: [...profile.experience, {
            id: Date.now(),
            company: experience.company || '',
            title: experience.title || '',
            location: experience.location || '',
            startDate: experience.startDate || '',
            endDate: experience.endDate || '',
            current: experience.current || false,
            description: experience.description || '',
        }]
    };
}

// Add education entry
export function addEducation(profile, education) {
    return {
        ...profile,
        education: [...profile.education, {
            id: Date.now(),
            school: education.school || '',
            degree: education.degree || '',
            field: education.field || '',
            startYear: education.startYear || '',
            endYear: education.endYear || '',
            gpa: education.gpa || '',
        }]
    };
}

// Parse skills from comma-separated string
export function parseSkills(skillsString) {
    return skillsString
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

// Get profile completion percentage
export function getProfileCompletion(profile) {
    let completed = 0;
    let total = 0;

    // Personal info (6 fields)
    const personalFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'headline'];
    personalFields.forEach(field => {
        total++;
        if (profile[field] && profile[field].trim()) completed++;
    });

    // Summary
    total++;
    if (profile.summary && profile.summary.trim()) completed++;

    // Experience
    total++;
    if (profile.experience && profile.experience.length > 0) completed++;

    // Education
    total++;
    if (profile.education && profile.education.length > 0) completed++;

    // Skills
    total++;
    if (profile.skills && profile.skills.length > 0) completed++;

    // Preferences
    total++;
    if (profile.preferences && profile.preferences.desiredRole) completed++;

    return Math.round((completed / total) * 100);
}

export default {
    saveProfile,
    loadProfile,
    saveCredentials,
    loadCredentials,
    clearAllData,
    addExperience,
    addEducation,
    parseSkills,
    getProfileCompletion,
    defaultProfile,
};
