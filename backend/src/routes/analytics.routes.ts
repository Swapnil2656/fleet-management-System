import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Fleet utilization metrics
router.get('/fleet-utilization', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const totalVehicles = await prisma.vehicle.count();
        const activeVehicles = await prisma.vehicle.count({ where: { status: 'ACTIVE' } });
        const inMaintenance = await prisma.vehicle.count({ where: { status: 'MAINTENANCE' } });
        const inactive = await prisma.vehicle.count({ where: { status: 'INACTIVE' } });

        // Get vehicles currently on trips
        const onTrip = await prisma.trip.count({
            where: { status: 'IN_PROGRESS' },
        });

        res.json({
            totalVehicles,
            activeVehicles,
            inMaintenance,
            inactive,
            onTrip,
            utilizationRate: totalVehicles > 0 ? ((onTrip / totalVehicles) * 100).toFixed(2) : 0,
        });
    } catch (error) {
        console.error('Fleet utilization error:', error);
        res.status(500).json({ error: 'Failed to fetch fleet utilization' });
    }
});

// Fuel consumption analytics
router.get('/fuel-consumption', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate, vehicleId } = req.query;

        const where: any = {};
        if (startDate || endDate) {
            where.startTime = {};
            if (startDate) where.startTime.gte = new Date(startDate as string);
            if (endDate) where.startTime.lte = new Date(endDate as string);
        }
        if (vehicleId) where.vehicleId = vehicleId;

        const routes = await prisma.route.findMany({
            where,
            include: {
                vehicle: true,
            },
        });

        const totalFuel = routes.reduce((sum, route) => sum + route.fuelConsumed, 0);
        const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
        const averageEfficiency = totalDistance > 0 ? totalDistance / totalFuel : 0;

        // Group by vehicle
        const byVehicle = routes.reduce((acc: any, route) => {
            const key = route.vehicleId;
            if (!acc[key]) {
                acc[key] = {
                    vehicleId: route.vehicleId,
                    registrationNumber: route.vehicle.registrationNumber,
                    totalFuel: 0,
                    totalDistance: 0,
                    trips: 0,
                };
            }
            acc[key].totalFuel += route.fuelConsumed;
            acc[key].totalDistance += route.distance;
            acc[key].trips += 1;
            return acc;
        }, {});

        res.json({
            summary: {
                totalFuel,
                totalDistance,
                averageEfficiency: averageEfficiency.toFixed(2),
                totalTrips: routes.length,
            },
            byVehicle: Object.values(byVehicle),
        });
    } catch (error) {
        console.error('Fuel consumption error:', error);
        res.status(500).json({ error: 'Failed to fetch fuel consumption data' });
    }
});

// Driver performance
router.get('/driver-performance', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const drivers = await prisma.driver.findMany({
            include: {
                trips: {
                    where: { status: 'COMPLETED' },
                },
            },
        });

        const performance = drivers.map((driver) => ({
            id: driver.id,
            name: driver.name,
            performanceScore: driver.performanceScore,
            totalTrips: driver.trips.length,
            status: driver.status,
        }));

        res.json(performance);
    } catch (error) {
        console.error('Driver performance error:', error);
        res.status(500).json({ error: 'Failed to fetch driver performance' });
    }
});

// Dashboard metrics
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const totalVehicles = await prisma.vehicle.count();
        const activeVehicles = await prisma.vehicle.count({ where: { status: 'ACTIVE' } });
        const totalDrivers = await prisma.driver.count();
        const activeAlerts = await prisma.alert.count({ where: { status: 'ACTIVE' } });
        const upcomingMaintenance = await prisma.maintenance.count({
            where: {
                status: 'SCHEDULED',
                scheduledDate: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
                },
            },
        });

        // Recent alerts
        const recentAlerts = await prisma.alert.findMany({
            where: { status: 'ACTIVE' },
            include: { vehicle: true },
            orderBy: { timestamp: 'desc' },
            take: 5,
        });

        res.json({
            metrics: {
                totalVehicles,
                activeVehicles,
                totalDrivers,
                activeAlerts,
                upcomingMaintenance,
            },
            recentAlerts,
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

export default router;
