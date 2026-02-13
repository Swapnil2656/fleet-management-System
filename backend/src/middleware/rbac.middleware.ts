import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}

// Role hierarchy: ADMIN > TRANSPORTER > DRIVER
const roleHierarchy: Record<string, number> = {
    ADMIN: 3,
    TRANSPORTER: 2,
    DRIVER: 1,
};

/**
 * Middleware to check if user has required role
 * @param roles - Array of allowed roles
 */
export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role;

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                error: 'Access denied',
                message: `This resource requires one of the following roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Middleware to check if user has minimum role level
 * @param minRole - Minimum required role
 */
export const requireMinRole = (minRole: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRoleLevel = roleHierarchy[req.user.role] || 0;
        const requiredLevel = roleHierarchy[minRole] || 0;

        if (userRoleLevel < requiredLevel) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `This resource requires ${minRole} level access or higher`
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 */
export const isAdmin = requireRole(['ADMIN']);

/**
 * Check if user is transporter or admin
 */
export const isTransporterOrAdmin = requireRole(['ADMIN', 'TRANSPORTER']);

/**
 * Check if user is driver
 */
export const isDriver = requireRole(['DRIVER']);

/**
 * Check if user owns the resource or is admin
 */
export const isOwnerOrAdmin = (getOwnerId: (req: AuthRequest) => string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const ownerId = getOwnerId(req);

        if (req.user.role === 'ADMIN' || req.user.id === ownerId) {
            return next();
        }

        return res.status(403).json({
            error: 'Access denied',
            message: 'You can only access your own resources'
        });
    };
};

export default {
    requireRole,
    requireMinRole,
    isAdmin,
    isTransporterOrAdmin,
    isDriver,
    isOwnerOrAdmin,
};
