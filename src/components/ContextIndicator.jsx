import React from 'react';
import { Briefcase, Code, FileText, ShoppingBag, HelpCircle } from 'lucide-react';

const ContextIndicator = ({ pageType = 'General', confidence = 0.9 }) => {

    const getIcon = () => {
        switch (pageType.toLowerCase()) {
            case 'job': return <Briefcase size={16} className="text-blue-400" />;
            case 'code': return <Code size={16} className="text-green-400" />;
            case 'article': return <FileText size={16} className="text-purple-400" />;
            case 'product': return <ShoppingBag size={16} className="text-orange-400" />;
            default: return <HelpCircle size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700/50 shadow-sm animate-in fade-in zoom-in duration-300">
            {getIcon()}
            <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Context detected</span>
                <span className="text-sm font-semibold text-gray-200">{pageType}</span>
            </div>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
        </div>
    );
};

export default ContextIndicator;
