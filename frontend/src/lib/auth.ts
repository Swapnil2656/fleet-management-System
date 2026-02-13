import api from './api';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    avatar?: string;
    companyName?: string;
    licenseNumber?: string;
    licenseExpiry?: Date;
    assignedVehicleId?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

class AuthService {
    private readonly TOKEN_KEY = 'token';
    private readonly USER_KEY = 'user';

    // Login
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
        });

        const data = response.data;

        // Store token and user info
        this.setToken(data.token);
        this.setUser(data.user);

        return data;
    }

    // Logout
    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        window.location.href = '/login';
    }

    // Get stored token
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Set token
    setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    // Get current user
    getUser(): User | null {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Set user
    setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Check if user has specific role
    hasRole(role: string): boolean {
        const user = this.getUser();
        return user?.role === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles: string[]): boolean {
        const user = this.getUser();
        return user ? roles.includes(user.role) : false;
    }

    // Get dashboard route based on role
    getDashboardRoute(): string {
        const user = this.getUser();
        if (!user) return '/login';

        switch (user.role) {
            case 'ADMIN':
                return '/admin';
            case 'TRANSPORTER':
                return '/transporter';
            case 'DRIVER':
                return '/driver';
            default:
                return '/login';
        }
    }
}

export const authService = new AuthService();
