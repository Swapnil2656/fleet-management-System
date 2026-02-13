'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Coordinate {
    lat: number;
    lng: number;
}

interface VehiclePosition {
    vehicleId: string;
    registrationNumber: string;
    currentPosition: Coordinate | null;
}

interface RouteData {
    coordinates: [number, number][];
    distance: number;
    duration: number;
}

interface MapContainerProps {
    vehicles: VehiclePosition[];
    selectedVehicleId?: string;
    onVehicleClick?: (vehicleId: string) => void;
    showRoute?: {
        origin: Coordinate;
        destination: Coordinate;
        waypoints?: Coordinate[];
    };
}

export default function MapContainer({
    vehicles,
    selectedVehicleId,
    onVehicleClick,
    showRoute
}: MapContainerProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [routeData, setRouteData] = useState<RouteData | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Initialize map with OpenStreetMap tiles
        const map = L.map(containerRef.current).setView([20.5937, 78.9629], 5); // India center

        // Use OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Fetch route from OpenRouteService
    useEffect(() => {
        if (!showRoute || !mapRef.current) return;

        const fetchRoute = async () => {
            try {
                const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjcwMmNmNDI1MGQ3YzQ2OGY4MzFmM2E4YzY5ZjAzOTk5IiwiaCI6Im11cm11cjY0In0=';

                const coordinates = [
                    [showRoute.origin.lng, showRoute.origin.lat],
                    ...(showRoute.waypoints || []).map(w => [w.lng, w.lat]),
                    [showRoute.destination.lng, showRoute.destination.lat]
                ];

                const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
                    method: 'POST',
                    headers: {
                        'Authorization': apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        coordinates: coordinates
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const route = data.routes[0];
                    const coords: [number, number][] = route.geometry.coordinates.map(
                        (coord: number[]) => [coord[1], coord[0]] as [number, number]
                    );

                    setRouteData({
                        coordinates: coords,
                        distance: route.summary.distance / 1000, // Convert to km
                        duration: route.summary.duration / 60 // Convert to minutes
                    });
                }
            } catch (error) {
                console.error('Error fetching route from OpenRouteService:', error);
            }
        };

        fetchRoute();
    }, [showRoute]);

    // Draw route on map
    useEffect(() => {
        if (!mapRef.current || !routeData) return;

        const map = mapRef.current;

        // Remove existing route
        if (routeLayerRef.current) {
            routeLayerRef.current.remove();
        }

        // Draw new route
        const polyline = L.polyline(routeData.coordinates, {
            color: '#4F46E5',
            weight: 4,
            opacity: 0.7,
        }).addTo(map);

        polyline.bindPopup(`
            <div class="text-sm">
                <div class="font-semibold">Route Information</div>
                <div class="text-gray-600 text-xs mt-1">Distance: ${routeData.distance.toFixed(2)} km</div>
                <div class="text-gray-600 text-xs">Duration: ${Math.round(routeData.duration)} min</div>
            </div>
        `);

        routeLayerRef.current = polyline;

        // Fit map to route bounds
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    }, [routeData]);

    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        // Add markers for vehicles with positions
        const bounds: L.LatLngExpression[] = [];

        vehicles.forEach((vehicle) => {
            if (!vehicle.currentPosition) return;

            const { lat, lng } = vehicle.currentPosition;
            const isSelected = vehicle.vehicleId === selectedVehicleId;

            // Custom truck icon
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 ${isSelected ? 'border-brand shadow-lg' : 'border-gray-400 shadow-md'
                    }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#4F46E5' : '#6B7280'
                    }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <div class="text-gray-600 text-xs mt-1">Click to view details</div>
          </div>
        `);

            marker.on('click', () => {
                onVehicleClick?.(vehicle.vehicleId);
            });

            markersRef.current.set(vehicle.vehicleId, marker);
            bounds.push([lat, lng]);
        });

        // Fit bounds if we have markers and no route
        if (bounds.length > 0 && !routeData) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [vehicles, selectedVehicleId, onVehicleClick, routeData]);

    return (
        <div className="ml-80 mr-96 h-screen relative">
            <div ref={containerRef} className="w-full h-full" />

            {/* Route Info Overlay */}
            {routeData && (
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
                    <h3 className="font-semibold text-sm mb-2">🗺️ Route via OpenRouteService</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                        <div>Distance: <span className="font-medium text-gray-900">{routeData.distance.toFixed(2)} km</span></div>
                        <div>Duration: <span className="font-medium text-gray-900">{Math.round(routeData.duration)} min</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}
