import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all routes
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const routes = await prisma.route.findMany({
            include: {
                vehicle: true,
            },
            orderBy: { startTime: 'desc' },
            take: 100,
        });

        res.json(routes);
    } catch (error) {
        console.error('Get routes error:', error);
        res.status(500).json({ error: 'Failed to fetch routes' });
    }
});

// Get route by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const route = await prisma.route.findUnique({
            where: { id },
            include: {
                vehicle: true,
                trips: true,
            },
        });

        if (!route) {
            return res.status(404).json({ error: 'Route not found' });
        }

        res.json(route);
    } catch (error) {
        console.error('Get route error:', error);
        res.status(500).json({ error: 'Failed to fetch route' });
    }
});

export default router;
