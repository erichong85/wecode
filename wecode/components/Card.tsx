import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'white' | 'yellow' | 'blue' | 'purple' | 'green' | 'pink';
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    variant = 'white',
    noPadding = false
}) => {
    const variants = {
        white: 'bg-white',
        yellow: 'bg-pop-yellow',
        blue: 'bg-pop-blue',
        purple: 'bg-pop-purple',
        green: 'bg-pop-green',
        pink: 'bg-pop-pink',
    };

    return (
        <div className={`
      border-4 border-charcoal shadow-neo rounded-xl overflow-hidden
      ${variants[variant]}
      ${noPadding ? '' : 'p-6'}
      ${className}
    `}>
            {children}
        </div>
    );
};
