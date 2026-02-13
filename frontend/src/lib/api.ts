import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: { email: string; password: string; name: string; role?: string }) =>
        api.post('/auth/register', data),
};

// Vehicles API
export const vehiclesAPI = {
    getAll: () => api.get('/vehicles'),
    getById: (id: string) => api.get(`/vehicles/${id}`),
    create: (data: any) => api.post('/vehicles', data),
    update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
    delete: (id: string) => api.delete(`/vehicles/${id}`),
};

// Drivers API
export const driversAPI = {
    getAll: () => api.get('/drivers'),
    getById: (id: string) => api.get(`/drivers/${id}`),
    create: (data: any) => api.post('/drivers', data),
    update: (id: string, data: any) => api.put(`/drivers/${id}`, data),
    delete: (id: string) => api.delete(`/drivers/${id}`),
};

// Tracking API
export const trackingAPI = {
    getLive: () => api.get('/tracking/live'),
    ingestGPS: (data: { vehicleId: string; coordinates: any[] }) =>
        api.post('/tracking/ingest', data),
    getHistory: (vehicleId: string, params?: any) =>
        api.get(`/tracking/history/${vehicleId}`, { params }),
    endRoute: (routeId: string) => api.post(`/tracking/end/${routeId}`),
};

// Maintenance API
export const maintenanceAPI = {
    getAll: (params?: any) => api.get('/maintenance', { params }),
    getSchedule: () => api.get('/maintenance/schedule'),
    predict: (data: { vehicleId: string; currentMileage: number }) =>
        api.post('/maintenance/predict', data),
    schedule: (data: any) => api.post('/maintenance', data),
    update: (id: string, data: any) => api.put(`/maintenance/${id}`, data),
    complete: (id: string, data: any) => api.put(`/maintenance/${id}/complete`, data),
    getOverdue: () => api.get('/maintenance/overdue'),
};

// Analytics API
export const analyticsAPI = {
    getFleetUtilization: () => api.get('/analytics/fleet-utilization'),
    getFuelConsumption: (params?: any) => api.get('/analytics/fuel-consumption', { params }),
    getDriverPerformance: () => api.get('/analytics/driver-performance'),
    getDashboard: () => api.get('/analytics/dashboard'),
};
