export interface Coordinates {
    lat: number;
    lng: number;
    timestamp: Date;
}

export interface CompressedRoute {
    coordinates: Coordinates[];
    compressionRatio: number;
}

export interface Vehicle {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
    fuelType?: string;
    capacity?: number;
    assignedDriverId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Driver {
    id: string;
    name: string;
    licenseNumber: string;
    email?: string;
    phone: string;
    performanceScore: number;
    status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'UNAVAILABLE';
    createdAt: Date;
    updatedAt: Date;
}

export interface Route {
    id: string;
    vehicleId: string;
    startTime: Date;
    endTime?: Date;
    compressedCoordinates: Coordinates[];
    distance: number;
    fuelConsumed: number;
    averageSpeed: number;
    maxSpeed: number;
    idleTime: number;
}

export interface Maintenance {
    id: string;
    vehicleId: string;
    type: 'ROUTINE' | 'PREVENTIVE' | 'REPAIR' | 'INSPECTION' | 'EMERGENCY';
    description: string;
    scheduledDate: Date;
    completedDate?: Date;
    cost: number;
    mileage?: number;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
    notes?: string;
}

export interface Alert {
    id: string;
    vehicleId?: string;
    type: 'SPEEDING' | 'UNAUTHORIZED_STOP' | 'ROUTE_DEVIATION' | 'MAINTENANCE_DUE' | 'FUEL_ANOMALY' | 'GEOFENCE_BREACH' | 'ENGINE_WARNING' | 'BATTERY_LOW' | 'EMERGENCY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    description: string;
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
    timestamp: Date;
    resolvedAt?: Date;
}

export interface Trip {
    id: string;
    vehicleId: string;
    driverId: string;
    routeId?: string;
    startLocation: string;
    endLocation: string;
    startTime: Date;
    endTime?: Date;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
    eta?: Date;
    actualArrival?: Date;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'FLEET_MANAGER' | 'DISPATCHER' | 'MAINTENANCE' | 'DRIVER';
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role?: string;
}
