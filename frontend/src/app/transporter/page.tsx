'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RouteGuard from '@/components/RouteGuard';
import { Truck, MapPin, Plus, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusCard from '@/components/ui/StatusCard';
import { authService } from '@/lib/auth';
import { tripService } from '@/lib/trip-service';
import { vehiclesAPI } from '@/lib/api';

// Dynamic import for map
const RouteMap = dynamic(() => import('@/components/maps/RouteMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function TransporterDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [user, setUser] = useState(authService.getUser());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tripsData, vehiclesData] = await Promise.all([
        tripService.getAllTrips(),
        vehiclesAPI.getAll()
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalTrips: trips.length,
    activeTrips: trips.filter((t: any) => t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED').length,
    pendingTrips: trips.filter((t: any) => t.status === 'PENDING').length,
    completedTrips: trips.filter((t: any) => t.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <RouteGuard allowedRoles={['TRANSPORTER']}>
      <div className="min-h-screen bg-bg">
        <div className="bg-white border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Transporter Dashboard</h1>
              <p className="text-sm text-text-secondary">{user?.companyName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                <p className="text-xs text-text-secondary">Transporter</p>
              </div>
              <Button variant="ghost" onClick={() => authService.logout()}>
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatusCard
              icon={<Truck size={24} />}
              label="Total Trips"
              value={stats.totalTrips.toString()}
              variant="primary"
            />
            <StatusCard
              icon={<CheckCircle size={24} />}
              label="Active"
              value={stats.activeTrips.toString()}
              variant="success"
            />
            <StatusCard
              icon={<AlertCircle size={24} />}
              label="Pending"
              value={stats.pendingTrips.toString()}
              variant="warning"
            />
            <StatusCard
              icon={<MapPin size={24} />}
              label="Completed"
              value={stats.completedTrips.toString()}
              variant="info"
            />
          </div>

          {/* Sample Route Map */}
          {trips.length > 0 && trips[0].origin && trips[0].destination && (
            <div className="bg-white rounded-xl border border-border p-6 mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4">🗺️ Trip Route Visualization</h2>
              <RouteMap
                origin={{ lat: 28.6139, lng: 77.2090 }}
                destination={{ lat: 19.0760, lng: 72.8777 }}
                className="h-96"
              />
              <p className="text-xs text-gray-500 mt-2">Optimized route powered by OpenRouteService</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Trip Management</h2>
              <Button variant="primary">
                <Plus size={18} className="mr-2" />
                Create New Trip
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Trip #</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Route</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Driver</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip: any) => (
                    <tr key={trip.id} className="border-t border-border hover:bg-bg transition-colors">
                      <td className="px-4 py-3 font-mono text-sm">{trip.tripNumber}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-text-primary">{trip.origin}</div>
                        <div className="text-xs text-text-secondary">→ {trip.destination}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {trip.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${trip.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          trip.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            trip.status === 'ACCEPTED' ? 'bg-purple-100 text-purple-700' :
                              trip.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{trip.distance} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Other Dashboards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => router.push('/admin')} className="justify-center">
                View Admin Dashboard
              </Button>
              <Button variant="secondary" onClick={() => router.push('/driver')} className="justify-center">
                View Driver Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
