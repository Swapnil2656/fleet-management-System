/**
 * Route Optimization Service
 * Integrates with OpenRouteService for route planning and optimization
 * Can be easily swapped for Google Maps, MapBox, or other providers
 */

interface Coordinate {
    lat: number;
    lng: number;
}

interface RouteOptimizationRequest {
    origin: Coordinate;
    destination: Coordinate;
    waypoints?: Coordinate[];
}

interface RouteOptimizationResponse {
    distance: number; // in kilometers
    duration: number; // in seconds
    coordinates: Coordinate[];
    instructions: any[];
    optimizedWaypointOrder?: number[];
}

class RouteOptimizerService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        // Using OpenRouteService for free tier
        // Can be changed to Google Maps, MapBox, etc.
        this.apiKey = process.env.ROUTE_API_KEY || '';
        this.baseUrl = process.env.ROUTE_API_URL || 'https://api.openrouteservice.org';
    }

    /**
     * Optimize route with multiple waypoints
     */
    async optimizeRoute(request: RouteOptimizationRequest): Promise<RouteOptimizationResponse> {
        try {
            // If no API key, return basic estimation
            if (!this.apiKey) {
                return this.calculateBasicRoute(request);
            }

            const coordinates = [
                [request.origin.lng, request.origin.lat],
                ...(request.waypoints || []).map(w => [w.lng, w.lat]),
                [request.destination.lng, request.destination.lat],
            ];

            const response = await fetch(`${this.baseUrl}/v2/directions/driving-car`, {
                method: 'POST',
                headers: {
                    'Authorization': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coordinates,
                    instructions: true,
                    preference: 'fastest', // or 'shortest'
                }),
            });

            if (!response.ok) {
                console.error('Route API error:', await response.text());
                return this.calculateBasicRoute(request);
            }

            const data = await response.json();
            const route = data.routes[0];

            return {
                distance: route.summary.distance / 1000, // Convert to km
                duration: route.summary.duration, // Already in seconds
                coordinates: route.geometry.coordinates.map((coord: number[]) => ({
                    lat: coord[1],
                    lng: coord[0],
                })),
                instructions: route.segments[0].steps,
            };
        } catch (error) {
            console.error('Route optimization error:', error);
            return this.calculateBasicRoute(request);
        }
    }

    /**
     * Fallback calculation using Haversine formula
     * Used when API is not available or fails
     */
    private calculateBasicRoute(request: RouteOptimizationRequest): RouteOptimizationResponse {
        const { origin, destination, waypoints = [] } = request;

        // Calculate total distance using Haversine formula
        let totalDistance = 0;
        let points = [origin, ...waypoints, destination];

        for (let i = 0; i < points.length - 1; i++) {
            totalDistance += this.haversineDistance(points[i], points[i + 1]);
        }

        // Estimate duration (assuming average speed of 60 km/h)
        const estimatedDuration = (totalDistance / 60) * 3600; // Convert to seconds

        return {
            distance: totalDistance,
            duration: estimatedDuration,
            coordinates: points,
            instructions: [],
        };
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(coord2.lat - coord1.lat);
        const dLon = this.toRad(coord2.lng - coord1.lng);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(coord1.lat)) *
            Math.cos(this.toRad(coord2.lat)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Geocode address to coordinates
     * Placeholder - would integrate with geocoding API
     */
    async geocode(address: string): Promise<Coordinate | null> {
        // TODO: Integrate with geocoding service
        // For now, return null - frontend should provide coordinates
        return null;
    }

    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(coord: Coordinate): Promise<string | null> {
        // TODO: Integrate with reverse geocoding service
        return null;
    }

    /**
     * Calculate fuel estimate based on distance and vehicle type
     */
    calculateFuelEstimate(distance: number, fuelType: string = 'Diesel'): number {
        // Average fuel consumption rates (liters per 100km)
        const consumptionRates: Record<string, number> = {
            'Diesel': 12, // 12L/100km for diesel trucks
            'Petrol': 14, // 14L/100km for petrol
            'Electric': 0, // Calculate kWh separately
        };

        const rate = consumptionRates[fuelType] || 12;
        return (distance / 100) * rate;
    }
}

export default new RouteOptimizerService();
