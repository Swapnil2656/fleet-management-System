'use client';

import React, { useState } from 'react';
import SearchInput from '../ui/SearchInput';
import VehicleListItem from './VehicleListItem';
import { Truck } from 'lucide-react';

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

interface SidebarProps {
    vehicles: Vehicle[];
    selectedVehicleId?: string;
    onSelectVehicle: (vehicleId: string) => void;
}

export default function Sidebar({ vehicles, selectedVehicleId, onSelectVehicle }: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredVehicles = vehicles.filter((vehicle) =>
        vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed left-0 top-0 w-80 h-screen bg-white border-r border-gray-200 shadow-panel flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <Truck className="text-brand" size={24} />
                    <h1 className="text-xl font-bold text-gray-900">Fleet Manager</h1>
                </div>
                <SearchInput
                    placeholder="Search vehicles..."
                    onSearch={setSearchQuery}
                />
            </div>

            {/* Vehicle List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="text-xs font-medium text-gray-500 mb-3">
                    {filteredVehicles.length} VEHICLES
                </div>
                <div className="space-y-2">
                    {filteredVehicles.map((vehicle) => (
                        <VehicleListItem
                            key={vehicle.id}
                            vehicle={vehicle}
                            isSelected={vehicle.id === selectedVehicleId}
                            onClick={() => onSelectVehicle(vehicle.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                    <div className="flex justify-between mb-1">
                        <span>Active</span>
                        <span className="font-medium text-gray-900">
                            {vehicles.filter((v) => v.status === 'ACTIVE').length}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Maintenance</span>
                        <span className="font-medium text-gray-900">
                            {vehicles.filter((v) => v.status === 'MAINTENANCE').length}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
