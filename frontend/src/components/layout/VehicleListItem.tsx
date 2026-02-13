import React from 'react';
import { Truck, Battery } from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import clsx from 'clsx';

interface Vehicle {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    status: string;
    assignedDriver?: {
        name: string;
    };
}

interface VehicleListItemProps {
    vehicle: Vehicle;
    isSelected: boolean;
    onClick: () => void;
}

export default function VehicleListItem({ vehicle, isSelected, onClick }: VehicleListItemProps) {
    const statusVariant = vehicle.status === 'ACTIVE' ? 'success' : vehicle.status === 'MAINTENANCE' ? 'warning' : 'neutral';

    // Mock battery level (in real app, this would come from vehicle data)
    const batteryLevel = 75;

    return (
        <div
            onClick={onClick}
            className={clsx(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                isSelected
                    ? 'bg-indigo-50 border-brand shadow-sm'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-sm'
            )}
        >
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Truck className="text-gray-600" size={20} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                        {vehicle.registrationNumber}
                    </div>
                    <Badge variant={statusVariant} className="ml-2">
                        {vehicle.status}
                    </Badge>
                </div>

                <div className="text-xs text-gray-600 mb-2">
                    {vehicle.make} {vehicle.model}
                </div>

                {vehicle.assignedDriver && (
                    <div className="text-xs text-gray-500 mb-2">
                        Driver: {vehicle.assignedDriver.name}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Battery className="text-gray-400" size={14} />
                    <ProgressBar value={batteryLevel} className="flex-1" />
                    <span className="text-xs text-gray-600 font-medium">{batteryLevel}%</span>
                </div>
            </div>
        </div>
    );
}
