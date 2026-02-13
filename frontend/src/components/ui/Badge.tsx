import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    children: React.ReactNode;
    className?: string;
}

export default function Badge({ variant, children, className }: BadgeProps) {
    const variantStyles = {
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200',
        neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
