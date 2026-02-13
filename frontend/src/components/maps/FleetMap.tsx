'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OPENROUTE_CONFIG } from '@/config/route-config';

interface Vehicle {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    currentPosition?: { lat: number; lng: number };
}

interface FleetMapProps {
    vehicles: Vehicle[];
    className?: string;
}

export default function FleetMap({ vehicles, className = '' }: FleetMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Initialize map
        const map = L.map(containerRef.current).setView([20.5937, 78.9629], 5);

        // Use OpenRouteService map tiles with your API key
        L.tileLayer(`https://maps.openrouteservice.org/osm-bright/{z}/{x}/{y}.png?api_key=${OPENROUTE_CONFIG.API_KEY}`, {
            attribution: '© OpenRouteService | Map data © OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        if (vehicles.length === 0) return;

        const bounds = L.latLngBounds([]);

        vehicles.forEach((vehicle) => {
            if (!vehicle.currentPosition) return;

            const { lat, lng } = vehicle.currentPosition;

            const icon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div class="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-blue-500 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2">
                            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
                            <path d="M15 18H9"></path>
                            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
                            <circle cx="17" cy="18" r="2"></circle>
                            <circle cx="7" cy="18" r="2"></circle>
                        </svg>
                    </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            });

            const marker = L.marker([lat, lng], { icon })
                .addTo(map)
                .bindPopup(`
                    <div class="text-sm">
                        <div class="font-semibold">${vehicle.registrationNumber}</div>
                        <div class="text-gray-600 text-xs mt-1">${vehicle.make} ${vehicle.model}</div>
                    </div>
                `);

            markersRef.current.set(vehicle.id, marker);
            bounds.extend([lat, lng]);
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [vehicles]);

    return (
        <div className={className}>
            <div ref={containerRef} className="w-full h-full rounded-lg" />
        </div>
    );
}
