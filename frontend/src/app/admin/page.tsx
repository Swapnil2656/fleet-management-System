'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RouteGuard from '@/components/RouteGuard';
import { Users, Truck, Activity, AlertTriangle, Plus, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusCard from '@/components/ui/StatusCard';
import { authService } from '@/lib/auth';
import { vehiclesAPI, analyticsAPI } from '@/lib/api';

// Dynamic import for map (Leaflet requires window)
const FleetMap = dynamic(() => import('@/components/maps/FleetMap'), {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeTrips: 0,
        totalDrivers: 0,
        alerts: 0,
    });
    const [vehicles, setVehicles] = useState([]);
    const [user, setUser] = useState(authService.getUser());

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [vehiclesRes, analyticsRes] = await Promise.all([
                vehiclesAPI.getAll(),
                analyticsAPI.getDashboard().catch(() => ({ data: {} })),
            ]);

            setVehicles(vehiclesRes.data);
            setStats({
                totalVehicles: vehiclesRes.data.length,
                activeTrips: analyticsRes.data?.activeTrips || 0,
                totalDrivers: analyticsRes.data?.totalDrivers || 0,
                alerts: analyticsRes.data?.alerts || 0,
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="text-text-secondary">Loading...</div>
            </div>
        );
    }

    return (
        <RouteGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-bg">
                {/* Header */}
                <div className="bg-white border-b border-border sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
                            <p className="text-sm text-text-secondary">Manage your fleet system</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                                <p className="text-xs text-text-secondary">Administrator</p>
                            </div>
                            <Button variant="ghost" onClick={handleLogout}>
                                <LogOut size={18} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatusCard
                            icon={<Truck size={24} />}
                            label="Total Vehicles"
                            value={stats.totalVehicles.toString()}
                            variant="primary"
                        />
                        <StatusCard
                            icon={<Activity size={24} />}
                            label="Active Trips"
                            value={stats.activeTrips.toString()}
                            variant="success"
                        />
                        <StatusCard
                            icon={<Users size={24} />}
                            label="Total Drivers"
                            value={stats.totalDrivers.toString()}
                            variant="info"
                        />
                        <StatusCard
                            icon={<AlertTriangle size={24} />}
                            label="Active Alerts"
                            value={stats.alerts.toString()}
                            variant="warning"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl border border-border p-6 mb-8">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="primary" className="justify-center">
                                <Plus size={18} className="mr-2" />
                                Add New Vehicle
                            </Button>
                            <Button variant="secondary" className="justify-center">
                                <Plus size={18} className="mr-2" />
                                Add New Driver
                            </Button>
                            <Button variant="secondary" className="justify-center">
                                <Users size={18} className="mr-2" />
                                Manage Users
                            </Button>
                        </div>
                    </div>

                    {/* Fleet Tracking Map */}
                    <div className="bg-white rounded-xl border border-border p-6 mb-8">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">🗺️ Fleet Tracking Map</h2>
                        <FleetMap vehicles={vehicles} className="h-96" />
                        <p className="text-xs text-gray-500 mt-2">Real-time vehicle locations powered by OpenStreetMap</p>
                    </div>

                    {/* Vehicles List */}
                    <div className="bg-white rounded-xl border border-border p-6">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Fleet Overview</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-bg">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Vehicle</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Status</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Registration</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Odometer</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Fuel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map((vehicle: any) => (
                                        <tr key={vehicle.id} className="border-t border-border hover:bg-bg transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-text-primary">{vehicle.make} {vehicle.model}</div>
                                                <div className="text-sm text-text-secondary">{vehicle.year}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                    vehicle.status === 'IN_MAINTENANCE' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {vehicle.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-text-secondary">{vehicle.registrationNumber}</td>
                                            <td className="px-4 py-3 text-text-secondary">{vehicle.odometer?.toLocaleString()} km</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${vehicle.fuelLevel > 50 ? 'bg-green-500' :
                                                                vehicle.fuelLevel > 20 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                                }`}
                                                            style={{ width: `${vehicle.fuelLevel}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-text-secondary">{vehicle.fuelLevel}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Dashboard Navigation */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 Other Dashboards</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                variant="secondary"
                                onClick={() => router.push('/transporter')}
                                className="justify-center"
                            >
                                View Transporter Dashboard
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => router.push('/driver')}
                                className="justify-center"
                            >
                                View Driver Dashboard
                            </Button>
                        </div>
                        <p className="text-sm text-blue-700 mt-3">
                            💡 As admin, you can view all dashboards. Logout and login with different credentials to test role-based access.
                        </p>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
