import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface TimelineItemProps {
    time: Date;
    title: string;
    description?: string;
    metadata?: string[];
}

export default function TimelineItem({ time, title, description, metadata }: TimelineItemProps) {
    return (
        <div className="relative pl-6 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
            <div className="absolute left-0 top-0 -translate-x-[6px] w-2.5 h-2.5 rounded-full bg-white border-2 border-brand" />
            <div className="text-xs text-gray-500 font-medium mb-1">
                {formatDistanceToNow(time, { addSuffix: true })}
            </div>
            <div className="text-sm text-gray-900 font-medium">{title}</div>
            {description && <div className="text-sm text-gray-600 mt-1">{description}</div>}
            {metadata && metadata.length > 0 && (
                <div className="flex gap-2 mt-2 text-xs text-gray-400">
                    {metadata.map((item, index) => (
                        <span key={index}>{item}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
