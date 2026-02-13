import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/rbac.middleware';
import { isTransporterOrAdmin, isDriver } from '../middleware/rbac.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Get all trips (admin sees all, transporter sees created trips, driver sees assigned trips)
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const user = req.user!;
        let trips;

        if (user.role === 'ADMIN') {
            // Admin sees all trips
            trips = await prisma.trip.findMany({
                include: {
                    createdBy: { select: { id: true, name: true, email: true, role: true, companyName: true } },
                    assignedTo: { select: { id: true, name: true, email: true, phone: true } },
                    vehicle: true,
                    route: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        } else if (user.role === 'TRANSPORTER') {
            // Transporter sees only trips they created
            trips = await prisma.trip.findMany({
                where: { createdById: user.id },
                include: {
                    createdBy: { select: { id: true, name: true, email: true, role: true, companyName: true } },
                    assignedTo: { select: { id: true, name: true, email: true, phone: true } },
                    vehicle: true,
                    route: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        } else if (user.role === 'DRIVER') {
            // Driver sees only trips assigned to them
            trips = await prisma.trip.findMany({
                where: { assignedToId: user.id },
                include: {
                    createdBy: { select: { id: true, name: true, email: true, companyName: true } },
                    vehicle: true,
                    route: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            return res.status(403).json({ error: 'Invalid role' });
        }

        res.json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
});

// Get trip by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = req.user!;

        const trip = await prisma.trip.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true, email: true, role: true, companyName: true } },
                assignedTo: { select: { id: true, name: true, email: true, phone: true, licenseNumber: true } },
                vehicle: true,
                route: true,
            },
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Check access permissions
        if (user.role !== 'ADMIN' && trip.createdById !== user.id && trip.assignedToId !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(trip);
    } catch (error) {
        console.error('Error fetching trip:', error);
        res.status(500).json({ error: 'Failed to fetch trip' });
    }
});

// Create new trip (Transporter or Admin only)
router.post('/', authenticate, isTransporterOrAdmin, async (req: AuthRequest, res) => {
    try {
        const user = req.user!;
        const {
            vehicleId,
            origin,
            destination,
            waypoints,
            distance,
            estimatedTime,
            estimatedFuel,
            cargoType,
            cargoWeight,
            specialInstructions,
            assignedToId, // Optional - can assign driver immediately or later
        } = req.body;

        // Generate unique trip number
        const tripCount = await prisma.trip.count();
        const tripNumber = `TRP-${String(tripCount + 1).padStart(3, '0')}-${new Date().getFullYear()}`;

        const trip = await prisma.trip.create({
            data: {
                tripNumber,
                createdById: user.id,
                vehicleId,
                origin,
                destination,
                waypoints: waypoints ? JSON.stringify(waypoints) : null,
                distance: parseFloat(distance) || 0,
                estimatedTime: parseInt(estimatedTime) || 0,
                estimatedFuel: parseFloat(estimatedFuel) || 0,
                cargoType,
                cargoWeight: cargoWeight ? parseFloat(cargoWeight) : null,
                specialInstructions,
                assignedToId: assignedToId || null,
                status: assignedToId ? 'PENDING' : 'PENDING', // PENDING until driver accepts
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true, companyName: true } },
                assignedTo: { select: { id: true, name: true, email: true, phone: true } },
                vehicle: true,
            },
        });

        res.status(201).json(trip);
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({ error: 'Failed to create trip' });
    }
});

// Assign trip to driver (Transporter or Admin only)
router.patch('/:id/assign', authenticate, isTransporterOrAdmin, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;
        const user = req.user!;

        const trip = await prisma.trip.findUnique({ where: { id } });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Check if user owns this trip (unless admin)
        if (user.role !== 'ADMIN' && trip.createdById !== user.id) {
            return res.status(403).json({ error: 'You can only assign your own trips' });
        }

        // Verify driver exists and has DRIVER role
        const driver = await prisma.user.findUnique({ where: { id: driverId } });
        if (!driver || driver.role !== 'DRIVER') {
            return res.status(400).json({ error: 'Invalid driver ID' });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id },
            data: {
                assignedToId: driverId,
                status: 'PENDING', // Driver needs to accept
            },
            include: {
                createdBy: { select: { id: true, name: true, email: true, companyName: true } },
                assignedTo: { select: { id: true, name: true, email: true, phone: true } },
                vehicle: true,
            },
        });

        res.json(updatedTrip);
    } catch (error) {
        console.error('Error assigning trip:', error);
        res.status(500).json({ error: 'Failed to assign trip' });
    }
});

// Driver accepts trip
router.patch('/:id/accept', authenticate, isDriver, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = req.user!;

        const trip = await prisma.trip.findUnique({ where: { id } });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.assignedToId !== user.id) {
            return res.status(403).json({ error: 'This trip is not assigned to you' });
        }

        if (trip.status !== 'PENDING') {
            return res.status(400).json({ error: 'Trip cannot be accepted in current status' });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id },
            data: { status: 'ACCEPTED' },
            include: {
                createdBy: { select: { name: true, companyName: true } },
                vehicle: true,
            },
        });

        res.json(updatedTrip);
    } catch (error) {
        console.error('Error accepting trip:', error);
        res.status(500).json({ error: 'Failed to accept trip' });
    }
});

// Driver rejects trip
router.patch('/:id/reject', authenticate, isDriver, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const user = req.user!;

        const trip = await prisma.trip.findUnique({ where: { id } });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.assignedToId !== user.id) {
            return res.status(403).json({ error: 'This trip is not assigned to you' });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason,
            },
            include: {
                createdBy: { select: { name: true, email: true, companyName: true } },
            },
        });

        res.json(updatedTrip);
    } catch (error) {
        console.error('Error rejecting trip:', error);
        res.status(500).json({ error: 'Failed to reject trip' });
    }
});

// Start trip (Driver only)
router.patch('/:id/start', authenticate, isDriver, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = req.user!;

        const trip = await prisma.trip.findUnique({ where: { id } });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.assignedToId !== user.id) {
            return res.status(403).json({ error: 'This trip is not assigned to you' });
        }

        if (trip.status !== 'ACCEPTED') {
            return res.status(400).json({ error: 'Trip must be accepted before starting' });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id },
            data: {
                status: 'IN_PROGRESS',
                actualStartTime: new Date(),
            },
            include: {
                vehicle: true,
            },
        });

        res.json(updatedTrip);
    } catch (error) {
        console.error('Error starting trip:', error);
        res.status(500).json({ error: 'Failed to start trip' });
    }
});

// Complete trip (Driver only)
router.patch('/:id/complete', authenticate, isDriver, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { completionProof } = req.body; // Optional completion proof (image URL, signature, etc.)
        const user = req.user!;

        const trip = await prisma.trip.findUnique({ where: { id } });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.assignedToId !== user.id) {
            return res.status(403).json({ error: 'This trip is not assigned to you' });
        }

        if (trip.status !== 'IN_PROGRESS') {
            return res.status(400).json({ error: 'Only in-progress trips can be completed' });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                actualEndTime: new Date(),
                completionProof: completionProof || null,
            },
            include: {
                createdBy: { select: { name: true, email: true, companyName: true } },
                vehicle: true,
            },
        });

        res.json(updatedTrip);
    } catch (error) {
        console.error('Error completing trip:', error);
        res.status(500).json({ error: 'Failed to complete trip' });
    }
});

// Update trip location (Driver only - for real-time tracking)
router.patch('/:id/location', authenticate, isDriver, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { lat, lng } = req.body;
        const user = req.user!;

        const trip = await prisma.trip.findUnique({ where: { id } });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        if (trip.assignedToId !== user.id) {
            return res.status(403).json({ error: 'This trip is not assigned to you' });
        }

        const updatedTrip = await prisma.trip.update({
            where: { id },
            data: {
                currentLocation: JSON.stringify({ lat, lng, timestamp: new Date().toISOString() }),
            },
        });

        res.json({ success: true, location: { lat, lng } });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
});

// Delete trip (Creator or Admin only)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const user = req.user!;

        const trip = await prisma.trip.findUnique({ where: { id } });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        // Only trip creator or admin can delete
        if (user.role !== 'ADMIN' && trip.createdById !== user.id) {
            return res.status(403).json({ error: 'Only trip creator or admin can delete trips' });
        }

        await prisma.trip.delete({ where: { id } });

        res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({ error: 'Failed to delete trip' });
    }
});

export default router;

