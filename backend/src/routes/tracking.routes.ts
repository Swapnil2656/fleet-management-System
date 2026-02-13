import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { compressRoute, calculateCompressionRatio, calculateTotalDistance } from '../services/compression.service';
import { io } from '../server';

const router = Router();
const prisma = new PrismaClient();

// Get real-time vehicle positions
router.get('/live', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        // Get latest route for each vehicle
        const vehicles = await prisma.vehicle.findMany({
            where: { status: 'ACTIVE' },
            include: {
                routes: {
                    orderBy: { startTime: 'desc' },
                    take: 1,
                },
                assignedDriver: true,
            },
        });

        const liveData = vehicles.map((vehicle) => {
            const latestRoute = vehicle.routes[0];
            let currentPosition = null;

            if (latestRoute && latestRoute.compressedCoordinates) {
                const coords = latestRoute.compressedCoordinates as any;
                if (Array.isArray(coords) && coords.length > 0) {
                    currentPosition = coords[coords.length - 1];
                }
            }

            return {
                vehicleId: vehicle.id,
                registrationNumber: vehicle.registrationNumber,
                make: vehicle.make,
                model: vehicle.model,
                status: vehicle.status,
                driver: vehicle.assignedDriver,
                currentPosition,
                lastUpdate: latestRoute?.updatedAt || null,
            };
        });

        res.json(liveData);
    } catch (error) {
        console.error('Get live tracking error:', error);
        res.status(500).json({ error: 'Failed to fetch live tracking data' });
    }
});

// Ingest GPS data (from vehicle tracking devices)
router.post('/ingest', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId, coordinates } = req.body;

        if (!Array.isArray(coordinates) || coordinates.length === 0) {
            return res.status(400).json({ error: 'Invalid coordinates data' });
        }

        // Compress the route
        const compressed = compressRoute(coordinates, 0.0001);
        const compressionRatio = calculateCompressionRatio(coordinates.length, compressed.length);
        const totalDistance = calculateTotalDistance(compressed);

        // Calculate metrics
        const startTime = new Date(coordinates[0].timestamp);
        const endTime = new Date(coordinates[coordinates.length - 1].timestamp);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const averageSpeed = durationHours > 0 ? totalDistance / durationHours : 0;

        // Find or create active route
        let route = await prisma.route.findFirst({
            where: {
                vehicleId,
                endTime: null,
            },
        });

        if (route) {
            // Update existing route
            route = await prisma.route.update({
                where: { id: route.id },
                data: {
                    compressedCoordinates: compressed,
                    rawCoordinates: coordinates,
                    distance: totalDistance,
                    averageSpeed,
                    updatedAt: new Date(),
                },
            });
        } else {
            // Create new route
            route = await prisma.route.create({
                data: {
                    vehicleId,
                    startTime,
                    compressedCoordinates: compressed,
                    rawCoordinates: coordinates,
                    distance: totalDistance,
                    averageSpeed,
                },
            });
        }

        // Emit real-time update via WebSocket
        io.to(`vehicle:${vehicleId}`).emit('position:update', {
            vehicleId,
            position: compressed[compressed.length - 1],
            timestamp: new Date(),
        });

        res.json({
            routeId: route.id,
            compressionRatio: `${compressionRatio.toFixed(2)}%`,
            originalPoints: coordinates.length,
            compressedPoints: compressed.length,
            distance: totalDistance,
        });
    } catch (error) {
        console.error('GPS ingest error:', error);
        res.status(500).json({ error: 'Failed to ingest GPS data' });
    }
});

// Get route history for a vehicle
router.get('/history/:vehicleId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { vehicleId } = req.params;
        const { startDate, endDate, limit = '50' } = req.query;

        const where: any = { vehicleId };

        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = new Date(startDate as string);
            if (endDate) where.startTime.lte = new Date(endDate as string);
        }

        const routes = await prisma.route.findMany({
            where,
            orderBy: { startTime: 'desc' },
            take: parseInt(limit as string),
        });

        res.json(routes);
    } catch (error) {
        console.error('Get route history error:', error);
        res.status(500).json({ error: 'Failed to fetch route history' });
    }
});

// End active route
router.post('/end/:routeId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { routeId } = req.params;

        const route = await prisma.route.update({
            where: { id: routeId },
            data: {
                endTime: new Date(),
            },
        });

        res.json(route);
    } catch (error) {
        console.error('End route error:', error);
        res.status(500).json({ error: 'Failed to end route' });
    }
});

export default router;
