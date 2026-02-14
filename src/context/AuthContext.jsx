import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AUTH_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : window.location.origin;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('session_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${AUTH_BASE_URL}/auth/status`, {
                headers: { 'X-Session-Token': token }
            });
            const data = await response.json();
            if (data.connected && data.user) {
                setUser(data.user);
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('session_token');
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

    const register = async (username, email, password) => {
        const response = await fetch(`${AUTH_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
    };

    const login = async (email, password) => {
        const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('session_token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        const token = localStorage.getItem('session_token');
        try {
            await fetch(`${AUTH_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'X-Session-Token': token }
            });
        } catch (e) {
            console.error("Logout error", e);
        }
        localStorage.removeItem('session_token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
