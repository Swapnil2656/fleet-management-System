'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RouteGuard from '@/components/RouteGuard';
import { Truck, MapPin, CheckCircle, XCircle, Play, LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusCard from '@/components/ui/StatusCard';
import { authService } from '@/lib/auth';
import { tripService } from '@/lib/trip-service';

// Dynamic import for map
const RouteMap = dynamic(() => import('@/components/maps/RouteMap'), {
  ssr: false,
  loading: () => <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">Loading route...</div>
});

export default function DriverDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(authService.getUser());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tripsData = await tripService.getAllTrips();
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTrip = async (tripId: string) => {
    try {
      await tripService.acceptTrip(tripId);
      loadData();
    } catch (error) {
      console.error('Error accepting trip:', error);
    }
  };

  const handleStartTrip = async (tripId: string) => {
    try {
      await tripService.startTrip(tripId);
      loadData();
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  const pendingTrips = trips.filter((t: any) => t.status === 'PENDING');
  const activeTrip = trips.find((t: any) => t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED');
  const completedTrips = trips.filter((t: any) => t.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <RouteGuard allowedRoles={['DRIVER']}>
      <div className="min-h-screen bg-bg">
        <div className="bg-white border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Driver Dashboard</h1>
              <p className="text-sm text-text-secondary">{user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">License: {user?.licenseNumber}</p>
                <p className="text-xs text-text-secondary">Driver</p>
              </div>
              <Button variant="ghost" onClick={() => authService.logout()}>
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatusCard
              icon={<Truck size={24} />}
              label="Pending Assignments"
              value={pendingTrips.length.toString()}
              variant="warning"
            />
            <StatusCard
              icon={<Play size={24} />}
              label="Active Trip"
              value={activeTrip ? '1' : '0'}
              variant="success"
            />
            <StatusCard
              icon={<CheckCircle size={24} />}
              label="Completed Today"
              value={completedTrips.toString()}
              variant="info"
            />
          </div>

          {activeTrip && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-green-900 mb-4">
                Active Trip - {activeTrip.tripNumber}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-green-700 mb-1">Origin</p>
                  <p className="font-medium text-green-900">{activeTrip.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 mb-1">Destination</p>
                  <p className="font-medium text-green-900">{activeTrip.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-green-700 mb-1">Distance</p>
                  <p className="font-medium text-green-900">{activeTrip.distance} km</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 mb-1">Est. Time</p>
                  <p className="font-medium text-green-900">{activeTrip.estimatedTime} min</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 mb-1">Cargo</p>
                  <p className="font-medium text-green-900">{activeTrip.cargoType || 'N/A'}</p>
                </div>
              </div>
              {activeTrip.status === 'ACCEPTED' && (
                <Button variant="primary" onClick={() => handleStartTrip(activeTrip.id)}>
                  <Play size={18} className="mr-2" />
                  Start Trip
                </Button>
              )}
              {activeTrip.status === 'IN_PROGRESS' && (
                <>
                  <div className="bg-green-100 p-4 rounded-lg mb-4">
                    <p className="text-green-800 font-medium">🚗 Trip in Progress - Navigate to destination</p>
                  </div>
                  <RouteMap
                    origin={{ lat: 28.6139, lng: 77.2090 }}
                    destination={{ lat: 19.0760, lng: 72.8777 }}
                    className="h-80"
                  />
                </>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Pending Trip Assignments</h2>
            {pendingTrips.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No pending trip assignments</p>
            ) : (
              <div className="space-y-4">
                {pendingTrips.map((trip: any) => (
                  <div key={trip.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-text-primary">{trip.tripNumber}</h3>
                      <span className="text-xs font-mono bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                        PENDING
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-text-secondary mb-1">From</p>
                        <p className="text-sm font-medium">{trip.origin}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">To</p>
                        <p className="text-sm font-medium">{trip.destination}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Distance</p>
                        <p className="text-sm font-medium">{trip.distance} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary mb-1">Cargo</p>
                        <p className="text-sm font-medium">{trip.cargoType || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        onClick={() => handleAcceptTrip(trip.id)}
                        className="flex-1"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        Accept Trip
                      </Button>
                      <Button variant="ghost">
                        <XCircle size={18} className="mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Other Dashboards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="secondary" onClick={() => router.push('/admin')} className="justify-center">
                View Admin Dashboard
              </Button>
              <Button variant="secondary" onClick={() => router.push('/transporter')} className="justify-center">
                View Transporter Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
