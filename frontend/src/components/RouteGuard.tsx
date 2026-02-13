'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

interface RouteGuardProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    requireAuth?: boolean;
}

export default function RouteGuard({
    children,
    allowedRoles,
    requireAuth = true
}: RouteGuardProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for client-side to ensure localStorage is available
        const checkAuth = () => {
            const isAuthenticated = authService.isAuthenticated();
            const user = authService.getUser();

            // If authentication is required and user is not authenticated
            if (requireAuth && !isAuthenticated) {
                setAuthorized(false);
                setLoading(false);
                router.push('/login');
                return;
            }

            // If user is authenticated but on login page, redirect to dashboard
            if (isAuthenticated && window.location.pathname === '/login') {
                router.push(authService.getDashboardRoute());
                return;
            }

            // Check role-based access
            if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                // Redirect to user's appropriate dashboard
                router.push(authService.getDashboardRoute());
                return;
            }

            // User is authorized
            setAuthorized(true);
            setLoading(false);
        };

        checkAuth();
    }, [router, allowedRoles, requireAuth]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    // Only render children if authorized
    return authorized ? <>{children}</> : null;
}

// Higher-order component for page-level guards
export function withAuth(
    Component: React.ComponentType,
    allowedRoles?: string[]
) {
    return function AuthenticatedComponent(props: any) {
        return (
            <RouteGuard allowedRoles={allowedRoles}>
                <Component {...props} />
            </RouteGuard>
        );
    };
}
