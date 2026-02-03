import React from 'react';
import ContextIndicator from './ContextIndicator';
import { Sparkles, FileText, Briefcase, Code, AlignLeft } from 'lucide-react';

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-gray-200 rounded-lg transition-all duration-200 border border-slate-600/30 hover:border-indigo-500/50 group"
    >
        <Icon size={18} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const AISidebar = ({ contextType = 'General', onAction, aiResponse, isThinking }) => {
    return (
        <aside className="w-96 bg-[#0F172A] border-l border-slate-700/50 flex flex-col h-full shadow-2xl relative z-20">

            {/* Header */}
            <div className="p-5 border-b border-slate-800/80 bg-[#0F172A]">
                <h2 className="text-gray-100 font-semibold text-lg flex items-center gap-2 mb-4">
                    <Sparkles className="text-indigo-500" size={20} fill="#4F46E5" fillOpacity={0.2} />
                    AI Assistant
                </h2>
                <ContextIndicator pageType={contextType} />
            </div>

            {/* Quick Actions */}
            <div className="p-5 flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Quick Actions</label>
                <QuickActionButton icon={AlignLeft} label="Summarize Page" onClick={() => onAction('Summarize this page')} />
                <QuickActionButton icon={FileText} label="Explain Content" onClick={() => onAction('Explain this content simply')} />
                <QuickActionButton icon={Briefcase} label="Job Eligibility" onClick={() => onAction('Am I eligible for this job?')} />
                <QuickActionButton icon={Code} label="Explain Code" onClick={() => onAction('Explain this code logic')} />
            </div>

            {/* Response Area */}
            <div className="flex-1 overflow-y-auto p-5 pt-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                    {isThinking ? 'Thinking...' : 'Response'}
                </label>

                <div className="bg-[#111827] rounded-xl border border-slate-700/50 p-4 min-h-[200px] text-gray-300 text-sm leading-relaxed shadow-inner">
                    {isThinking ? (
                        <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                            <Sparkles size={16} />
                            <span>Analyzing page content...</span>
                        </div>
                    ) : aiResponse ? (
                        <div className="markdown-prose">
                            {aiResponse}
                        </div>
                    ) : (
                        <div className="text-slate-500 text-center mt-10 italic">
                            Select an action or ask a question below.
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default AISidebar;
