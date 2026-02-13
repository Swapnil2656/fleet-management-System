import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'medium',
    className,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-brand text-white border-brand hover:bg-brand-dark',
        secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100',
    };

    const sizeStyles = {
        small: 'px-3 py-2 text-xs',
        medium: 'px-4 py-2.5 text-sm',
        large: 'px-5 py-3 text-base',
    };

    return (
        <button
            className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}
