'use client';

import React from 'react';
import { X, MapPin, Gauge, Fuel, Clock, Calendar } from 'lucide-react';
import Badge from '../ui/Badge';
import StatusCard from '../ui/StatusCard';
import TimelineItem from '../ui/TimelineItem';
import Button from '../ui/Button';

interface Vehicle {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    status: string;
    assignedDriver?: {
        name: string;
    };
}

interface DetailsPanelProps {
    vehicle: Vehicle | null;
    onClose: () => void;
}

export default function DetailsPanel({ vehicle, onClose }: DetailsPanelProps) {
    if (!vehicle) {
        return (
            <div className="fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-panel p-6 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <MapPin className="mx-auto mb-2 text-gray-400" size={48} />
                    <p className="text-sm">Select a vehicle to view details</p>
                </div>
            </div>
        );
    }

    const statusVariant = vehicle.status === 'ACTIVE' ? 'success' : vehicle.status === 'MAINTENANCE' ? 'warning' : 'neutral';

    // Mock data for demonstration
    const mockEvents = [
        {
            time: new Date(Date.now() - 1000 * 60 * 30),
            title: 'Route started',
            description: 'Departed from warehouse',
            metadata: ['40.7128°N, 74.0060°W'],
        },
        {
            time: new Date(Date.now() - 1000 * 60 * 60 * 2),
            title: 'Delivery completed',
            description: 'Package delivered successfully',
            metadata: ['Customer #1234'],
        },
        {
            time: new Date(Date.now() - 1000 * 60 * 60 * 5),
            title: 'Maintenance check',
            description: 'Routine inspection completed',
            metadata: ['Oil change', 'Tire rotation'],
        },
    ];

    return (
        <div className="fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-panel overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{vehicle.registrationNumber}</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <Badge variant={statusVariant}>{vehicle.status}</Badge>
            </div>

            {/* Status Cards */}
            <div className="p-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Status</h3>

                <StatusCard
                    icon={MapPin}
                    label="Current Location"
                    value="New York, NY"
                    iconColor="text-brand"
                />

                <StatusCard
                    icon={Gauge}
                    label="Speed"
                    value="45 km/h"
                    iconColor="text-blue-500"
                />

                <StatusCard
                    icon={Fuel}
                    label="Fuel Level"
                    value="75%"
                    iconColor="text-green-500"
                />

                <StatusCard
                    icon={Clock}
                    label="Engine Hours"
                    value="1,234 hrs"
                    iconColor="text-gray-500"
                />
            </div>

            {/* Driver Info */}
            {vehicle.assignedDriver && (
                <div className="px-6 pb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Assigned Driver</h3>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">{vehicle.assignedDriver.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Performance Score: 4.5/5.0</div>
                    </div>
                </div>
            )}

            {/* Next Maintenance */}
            <div className="px-6 pb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Next Maintenance</h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-yellow-900">
                        <Calendar size={16} />
                        <span>Scheduled in 7 days</span>
                    </div>
                    <div className="text-xs text-yellow-700 mt-1">Routine oil change and inspection</div>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="px-6 pb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div>
                    {mockEvents.map((event, index) => (
                        <TimelineItem
                            key={index}
                            time={event.time}
                            title={event.title}
                            description={event.description}
                            metadata={event.metadata}
                        />
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 space-y-2">
                <Button variant="primary" className="w-full">
                    Track Route
                </Button>
                <Button variant="secondary" className="w-full">
                    Schedule Maintenance
                </Button>
            </div>
        </div>
    );
}
