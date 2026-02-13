'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { OPENROUTE_CONFIG } from '@/config/route-config';

interface RouteMapProps {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    waypoints?: { lat: number; lng: number }[];
    className?: string;
}

export default function RouteMap({ origin, destination, waypoints = [], className = '' }: RouteMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const routeLayerRef = useRef<L.Polyline | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current).setView([origin.lat, origin.lng], 10);

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
    }, [origin]);

    useEffect(() => {
        if (!mapRef.current) return;

        const fetchRoute = async () => {
            try {
                setLoading(true);

                // Build coordinates array for route optimization
                const coordinates = [
                    [origin.lng, origin.lat],
                    ...waypoints.map(w => [w.lng, w.lat]),
                    [destination.lng, destination.lat]
                ];

                // Call OpenRouteService API with YOUR API KEY
                const response = await fetch(`${OPENROUTE_CONFIG.BASE_URL}${OPENROUTE_CONFIG.ENDPOINTS.DIRECTIONS}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': OPENROUTE_CONFIG.API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        coordinates,
                        preference: 'fastest', // Route optimization preference
                        units: 'km',
                        geometry: true,
                        instructions: true
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const route = data.routes[0];
                    const coords: [number, number][] = route.geometry.coordinates.map(
                        (coord: number[]) => [coord[1], coord[0]] as [number, number]
                    );

                    // Remove existing route
                    if (routeLayerRef.current) {
                        routeLayerRef.current.remove();
                    }

                    // Draw optimized route with blue line
                    const polyline = L.polyline(coords, {
                        color: '#4F46E5',
                        weight: 5,
                        opacity: 0.8,
                    }).addTo(mapRef.current!);

                    polyline.bindPopup(`
                        <div class="text-sm font-semibold">Optimized Route</div>
                        <div class="text-xs text-gray-600">Powered by OpenRouteService</div>
                    `);

                    routeLayerRef.current = polyline;

                    // Add origin marker
                    L.marker([origin.lat, origin.lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>',
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })
                    })
                        .addTo(mapRef.current!)
                        .bindPopup('<div class="text-sm font-semibold">📍 Origin</div>');

                    // Add destination marker
                    L.marker([destination.lat, destination.lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>',
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })
                    })
                        .addTo(mapRef.current!)
                        .bindPopup('<div class="text-sm font-semibold">🎯 Destination</div>');

                    // Fit map to show entire route
                    mapRef.current!.fitBounds(polyline.getBounds(), { padding: [50, 50] });

                    setRouteInfo({
                        distance: route.summary.distance / 1000,
                        duration: route.summary.duration / 60
                    });
                } else {
                    console.error('Route optimization failed:', await response.text());
                }
            } catch (error) {
                console.error('Error fetching optimized route from OpenRouteService:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoute();
    }, [origin, destination, waypoints]);

    return (
        <div className={`relative ${className}`}>
            <div ref={containerRef} className="w-full h-full rounded-lg" />
            {loading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 z-[1000]">
                    <div className="text-sm font-medium text-gray-700">🗺️ Calculating optimized route...</div>
                </div>
            )}
            {routeInfo && !loading && (
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                    <div className="text-xs font-semibold text-gray-700 mb-1">🚗 OpenRouteService Route</div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                        <div>Distance: <span className="font-medium text-blue-600">{routeInfo.distance.toFixed(2)} km</span></div>
                        <div>Duration: <span className="font-medium text-blue-600">{Math.round(routeInfo.duration)} min</span></div>
                        <div className="text-[10px] text-gray-400 mt-1">Optimized: Fastest route</div>
                    </div>
                </div>
            )}
        </div>
    );
}
