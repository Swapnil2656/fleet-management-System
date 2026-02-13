interface Coordinate {
    lat: number;
    lng: number;
    timestamp?: Date;
}

/**
 * Douglas-Peucker algorithm for route compression
 * Reduces GPS data points while maintaining route accuracy
 * @param points - Array of GPS coordinates
 * @param epsilon - Tolerance level (higher = more compression, lower accuracy)
 * @returns Compressed array of coordinates
 */
export function compressRoute(points: Coordinate[], epsilon: number = 0.0001): Coordinate[] {
    if (points.length <= 2) {
        return points;
    }

    // Find the point with maximum distance from line between first and last
    let maxDistance = 0;
    let maxIndex = 0;

    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
        const distance = perpendicularDistance(points[i], start, end);
        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }

    // If max distance is greater than epsilon, recursively simplify
    if (maxDistance > epsilon) {
        const leftSegment = compressRoute(points.slice(0, maxIndex + 1), epsilon);
        const rightSegment = compressRoute(points.slice(maxIndex), epsilon);

        // Combine results, removing duplicate middle point
        return [...leftSegment.slice(0, -1), ...rightSegment];
    } else {
        // If max distance is less than epsilon, return just the endpoints
        return [start, end];
    }
}

/**
 * Calculate perpendicular distance from point to line segment
 */
function perpendicularDistance(point: Coordinate, lineStart: Coordinate, lineEnd: Coordinate): number {
    const { lat: x, lng: y } = point;
    const { lat: x1, lng: y1 } = lineStart;
    const { lat: x2, lng: y2 } = lineEnd;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate compression ratio
 */
export function calculateCompressionRatio(originalCount: number, compressedCount: number): number {
    if (originalCount === 0) return 0;
    return ((originalCount - compressedCount) / originalCount) * 100;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLng = toRadians(coord2.lng - coord1.lng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(coord1.lat)) *
        Math.cos(toRadians(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calculate total route distance
 */
export function calculateTotalDistance(coordinates: Coordinate[]): number {
    let totalDistance = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
        totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
    }

    return totalDistance;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}
