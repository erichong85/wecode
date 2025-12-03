import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface EmptyStateProps {
    message: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
            <div className="w-64 h-64 mb-6 relative">
                {/* Custom Pop Art / Cyberpunk SVG Illustration */}
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-neo">
                    {/* Background Elements */}
                    <circle cx="100" cy="100" r="80" fill="#1a1a1a" stroke="#000" strokeWidth="4" />
                    <path d="M40 100 L160 100" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M100 40 L100 160" stroke="#333" strokeWidth="2" strokeDasharray="4 4" />

                    {/* Abstract "Empty" Box */}
                    <rect x="60" y="60" width="80" height="80" rx="8" fill="#fff" stroke="#000" strokeWidth="4" />
                    <path d="M70 70 L90 70" stroke="#000" strokeWidth="4" strokeLinecap="round" />
                    <path d="M70 85 L110 85" stroke="#000" strokeWidth="4" strokeLinecap="round" />

                    {/* Floating Elements (Pop Style) */}
                    <circle cx="150" cy="50" r="10" fill="#FFD700" stroke="#000" strokeWidth="3" className="animate-bounce" style={{ animationDuration: '3s' }} />
                    <rect x="30" y="140" width="20" height="20" fill="#FF00FF" stroke="#000" strokeWidth="3" className="animate-spin" style={{ animationDuration: '10s' }} />
                    <path d="M160 150 L170 140 L180 150" stroke="#00FFFF" strokeWidth="4" fill="none" className="animate-pulse" />

                    {/* "Ghost" Face in the box */}
                    <circle cx="85" cy="100" r="4" fill="#000" />
                    <circle cx="115" cy="100" r="4" fill="#000" />
                    <path d="M90 120 Q100 130 110 120" stroke="#000" strokeWidth="3" fill="none" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-charcoal dark:text-white mb-4">{message}</h3>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};
