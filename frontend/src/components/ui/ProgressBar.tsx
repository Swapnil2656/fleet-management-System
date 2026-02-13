import React from 'react';

interface ProgressBarProps {
    value: number; // 0-100
    variant?: 'high' | 'medium' | 'low';
    className?: string;
}

export default function ProgressBar({ value, variant = 'high', className }: ProgressBarProps) {
    const variantColors = {
        high: 'bg-success',
        medium: 'bg-warning',
        low: 'bg-danger',
    };

    // Auto-determine variant based on value if not specified
    const autoVariant = value >= 60 ? 'high' : value >= 30 ? 'medium' : 'low';
    const finalVariant = variant || autoVariant;

    return (
        <div className={`h-1.5 w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
            <div
                className={`h-full rounded-full transition-all duration-300 ${variantColors[finalVariant]}`}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}
