import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

const AIInput = ({ onSend, disabled }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || disabled) return;
        onSend(input);
        setInput('');
    };

    return (
        <div className="bg-[#0F172A] border-t border-slate-800 p-4 relative z-30">
            <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center gap-3">

                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={disabled}
                        placeholder="Ask about this page..."
                        className="w-full bg-[#1E293B] text-gray-100 placeholder-slate-500 px-5 py-3.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-lg relative z-10"
                    />
                    <Sparkles size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 z-10 pointer-events-none" />
                </div>

                <button
                    type="submit"
                    disabled={disabled || !input.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25 active:scale-95 duration-200"
                >
                    <Send size={20} className={disabled ? "" : "ml-0.5"} />
                </button>
            </form>
        </div>
    );
};

export default AIInput;
