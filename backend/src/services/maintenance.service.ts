import { PrismaClient, Maintenance, MaintenanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface MaintenanceRule {
    type: string;
    mileageThreshold?: number;
    timeThreshold?: number; // in days
    description: string;
}

const MAINTENANCE_RULES: MaintenanceRule[] = [
    { type: 'ROUTINE', mileageThreshold: 5000, description: 'Routine oil change and inspection' },
    { type: 'ROUTINE', mileageThreshold: 10000, description: 'Major service and filter replacement' },
    { type: 'INSPECTION', timeThreshold: 180, description: 'Semi-annual safety inspection' },
    { type: 'PREVENTIVE', mileageThreshold: 50000, description: 'Brake system inspection' },
    { type: 'PREVENTIVE', mileageThreshold: 100000, description: 'Transmission service' },
];

/**
 * Predict upcoming maintenance based on vehicle mileage and time
 */
export async function predictMaintenance(vehicleId: string, currentMileage: number) {
    const predictions: Array<{
        type: string;
        description: string;
        estimatedDate: Date;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
    }> = [];

    // Get last maintenance records
    const lastMaintenance = await prisma.maintenance.findMany({
        where: { vehicleId, status: MaintenanceStatus.COMPLETED },
        orderBy: { completedDate: 'desc' },
        take: 10,
    });

    // Check mileage-based rules
    for (const rule of MAINTENANCE_RULES) {
        if (rule.mileageThreshold) {
            const lastSimilar = lastMaintenance.find((m) => m.type === rule.type);
            const mileageSinceLastService = lastSimilar
                ? currentMileage - (lastSimilar.mileage || 0)
                : currentMileage;

            if (mileageSinceLastService >= rule.mileageThreshold * 0.8) {
                const priority =
                    mileageSinceLastService >= rule.mileageThreshold
                        ? 'HIGH'
                        : mileageSinceLastService >= rule.mileageThreshold * 0.9
                            ? 'MEDIUM'
                            : 'LOW';

                // Estimate based on average daily mileage (assume 100km/day)
                const remainingMileage = rule.mileageThreshold - mileageSinceLastService;
                const daysUntilDue = Math.max(0, remainingMileage / 100);

                predictions.push({
                    type: rule.type,
                    description: rule.description,
                    estimatedDate: new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000),
                    priority,
                });
            }
        }
    }

    return predictions;
}

/**
 * Check for overdue maintenance
 */
export async function checkOverdueMaintenance() {
    const now = new Date();

    const overdue = await prisma.maintenance.findMany({
        where: {
            status: MaintenanceStatus.SCHEDULED,
            scheduledDate: {
                lt: now,
            },
        },
        include: {
            vehicle: true,
        },
    });

    // Update status to OVERDUE
    for (const maintenance of overdue) {
        await prisma.maintenance.update({
            where: { id: maintenance.id },
            data: { status: MaintenanceStatus.OVERDUE },
        });
    }

    return overdue;
}

/**
 * Schedule maintenance
 */
export async function scheduleMaintenance(data: {
    vehicleId: string;
    type: string;
    description: string;
    scheduledDate: Date;
    estimatedCost?: number;
}) {
    return await prisma.maintenance.create({
        data: {
            vehicleId: data.vehicleId,
            type: data.type as any,
            description: data.description,
            scheduledDate: data.scheduledDate,
            cost: data.estimatedCost || 0,
            status: MaintenanceStatus.SCHEDULED,
        },
    });
}

/**
 * Calculate maintenance costs for a vehicle
 */
export async function calculateMaintenanceCosts(vehicleId: string, startDate: Date, endDate: Date) {
    const maintenance = await prisma.maintenance.findMany({
        where: {
            vehicleId,
            completedDate: {
                gte: startDate,
                lte: endDate,
            },
            status: MaintenanceStatus.COMPLETED,
        },
    });

    const totalCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const averageCost = maintenance.length > 0 ? totalCost / maintenance.length : 0;

    return {
        totalCost,
        averageCost,
        count: maintenance.length,
        breakdown: maintenance.map((m) => ({
            type: m.type,
            cost: m.cost,
            date: m.completedDate,
        })),
    };
}
