import React from 'react';

interface StatusCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export default function StatusCard({ icon, label, value, variant = 'primary' }: StatusCardProps) {
    const variantColors = {
        primary: 'text-brand',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        danger: 'text-red-600',
        info: 'text-blue-600',
    };

    const iconColor = variantColors[variant];

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className={iconColor}>{icon}</div>
            <div className="flex-1">
                <div className="text-xs text-gray-500 font-medium">{label}</div>
                <div className="text-sm text-gray-900 font-semibold mt-0.5">{value}</div>
            </div>
        </div>
    );
}
