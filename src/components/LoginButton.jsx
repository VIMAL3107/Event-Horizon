import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const LoginButton = () => {
    const { isAuthenticated, login, logout, user, loading } = useAuth();

    if (loading) return <div className="text-gray-400 text-sm">Targeting Auth...</div>;

    if (isAuthenticated) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-400 text-xs border border-green-500/30 px-3 py-1.5 rounded-full bg-green-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                    {user?.email || 'Connected'}
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors ml-1"
                >
                    <LogOut size={12} />
                    Term Link
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all duration-300 border border-slate-700 hover:border-blue-500/50"
        >
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium text-slate-200 group-hover:text-white">Initialize Link</span>
        </button>
    );
};

export default LoginButton;
