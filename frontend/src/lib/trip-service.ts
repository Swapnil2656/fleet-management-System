import api from './api';

export interface Trip {
    id: string;
    tripNumber: string;
    createdById: string;
    assignedToId?: string;
    vehicleId: string;
    origin: string;
    destination: string;
    waypoints?: string;
    optimizedRoute?: string;
    distance: number;
    estimatedTime: number;
    estimatedFuel: number;
    cargoType?: string;
    cargoWeight?: number;
    specialInstructions?: string;
    status: string;
    actualStartTime?: Date;
    actualEndTime?: Date;
    rejectionReason?: string;
    currentLocation?: string;
    completionProof?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: any;
    assignedTo?: any;
    vehicle?: any;
    route?: any;
}

export interface CreateTripData {
    vehicleId: string;
    origin: string;
    destination: string;
    waypoints?: any[];
    distance: number;
    estimatedTime: number;
    estimatedFuel: number;
    cargoType?: string;
    cargoWeight?: number;
    specialInstructions?: string;
    assignedToId?: string;
}

class TripService {
    // Get all trips (role-filtered on backend)
    async getAllTrips(): Promise<Trip[]> {
        const response = await api.get<Trip[]>('/trips');
        return response.data;
    }

    // Get trip by ID
    async getTripById(id: string): Promise<Trip> {
        const response = await api.get<Trip>(`/trips/${id}`);
        return response.data;
    }

    // Create new trip
    async createTrip(data: CreateTripData): Promise<Trip> {
        const response = await api.post<Trip>('/trips', data);
        return response.data;
    }

    // Assign trip to driver
    async assignTrip(tripId: string, driverId: string): Promise<Trip> {
        const response = await api.patch<Trip>(`/trips/${tripId}/assign`, { driverId });
        return response.data;
    }

    // Driver accepts trip
    async acceptTrip(tripId: string): Promise<Trip> {
        const response = await api.patch<Trip>(`/trips/${tripId}/accept`, {});
        return response.data;
    }

    // Driver rejects trip
    async rejectTrip(tripId: string, reason: string): Promise<Trip> {
        const response = await api.patch<Trip>(`/trips/${tripId}/reject`, { reason });
        return response.data;
    }

    // Start trip
    async startTrip(tripId: string): Promise<Trip> {
        const response = await api.patch<Trip>(`/trips/${tripId}/start`, {});
        return response.data;
    }

    // Complete trip
    async completeTrip(tripId: string, completionProof?: string): Promise<Trip> {
        const response = await api.patch<Trip>(`/trips/${tripId}/complete`, { completionProof });
        return response.data;
    }

    // Update location
    async updateLocation(tripId: string, lat: number, lng: number): Promise<void> {
        await api.patch<void>(`/trips/${tripId}/location`, { lat, lng });
    }

    // Delete trip
    async deleteTrip(tripId: string): Promise<void> {
        await api.delete<void>(`/trips/${tripId}`);
    }
}

export const tripService = new TripService();
