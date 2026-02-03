import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:8001/auth/status');
            const data = await response.json();
            if (data.connected && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Auth check failed", error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        window.location.href = 'http://localhost:8001/auth/login';
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:8001/auth/logout');
        } catch (e) {
            console.error("Logout error", e);
        }
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('comet_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
