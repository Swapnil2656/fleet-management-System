'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import DetailsPanel from '@/components/layout/DetailsPanel';
import { vehiclesAPI, trackingAPI } from '@/lib/api';

// Dynamically import MapContainer with SSR disabled (Leaflet requires window)
const MapContainer = dynamic(() => import('@/components/layout/MapContainer'), {
    ssr: false,
    loading: () => <div className="ml-80 mr-96 h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading map...</div>
    </div>
});

export default function DashboardPage() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>();
    const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
    const [livePositions, setLivePositions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication FIRST - redirect immediately if no token
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Check for role-based dashboard preference
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                const dashboardRoute = userData.role === 'ADMIN' ? '/admin'
                    : userData.role === 'TRANSPORTER' ? '/transporter'
                        : userData.role === 'DRIVER' ? '/driver'
                            : null;

                if (dashboardRoute) {
                    router.push(dashboardRoute);
                    return;
                }
            } catch (e) {
                // If user data is corrupted, continue to tracking page
            }
        }

        // Load initial data for tracking page
        loadVehicles();
        loadLivePositions();

        // Poll for live updates every 10 seconds
        const interval = setInterval(() => {
            loadLivePositions();
        }, 10000);

        return () => clearInterval(interval);
    }, [router]);

    useEffect(() => {
        if (selectedVehicleId) {
            loadVehicleDetails(selectedVehicleId);
        } else {
            setSelectedVehicle(null);
        }
    }, [selectedVehicleId]);

    const loadVehicles = async () => {
        try {
            const response = await vehiclesAPI.getAll();
            setVehicles(response.data);
        } catch (error) {
            console.error('Failed to load vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLivePositions = async () => {
        try {
            const response = await trackingAPI.getLive();
            setLivePositions(response.data);
        } catch (error) {
            console.error('Failed to load live positions:', error);
        }
    };

    const loadVehicleDetails = async (vehicleId: string) => {
        try {
            const response = await vehiclesAPI.getById(vehicleId);
            setSelectedVehicle(response.data);
        } catch (error) {
            console.error('Failed to load vehicle details:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading fleet data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            <Sidebar
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={setSelectedVehicleId}
            />

            <MapContainer
                vehicles={livePositions}
                selectedVehicleId={selectedVehicleId}
                onVehicleClick={setSelectedVehicleId}
            />

            <DetailsPanel
                vehicle={selectedVehicle}
                onClose={() => setSelectedVehicleId(undefined)}
            />
        </div>
    );
}
