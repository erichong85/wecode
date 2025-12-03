import React from 'react';

export const PopLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`flex items-center justify-center space-x-2 ${className}`}>
            <div className="w-4 h-4 bg-pop-yellow dark:bg-neon-yellow border-2 border-charcoal dark:border-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-4 h-4 bg-pop-blue dark:bg-neon-blue border-2 border-charcoal dark:border-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-4 h-4 bg-pop-pink dark:bg-neon-pink border-2 border-charcoal dark:border-white rounded-full animate-bounce"></div>
        </div>
    );
};
