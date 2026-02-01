import { Point, LineSegment, Vector2D, PHYSICS } from '../types';

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the length of a polyline (series of points)
 */
export function polylineLength(points: Point[]): number {
    if (points.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < points.length; i++) {
        total += distance(points[i - 1], points[i]);
    }
    return total;
}

/**
 * Convert polyline points to line segments
 */
export function pointsToSegments(points: Point[]): LineSegment[] {
    const segments: LineSegment[] = [];
    for (let i = 1; i < points.length; i++) {
        segments.push({
            start: points[i - 1],
            end: points[i],
        });
    }
    return segments;
}

/**
 * Calculate shortest distance from point to line segment
 */
export function pointToSegmentDistance(
    point: Point,
    segment: LineSegment
): { distance: number; closest: Point } {
    const { start, end } = segment;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        // Segment is a point
        return {
            distance: distance(point, start),
            closest: start,
        };
    }

    // Calculate projection parameter
    let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const closest: Point = {
        x: start.x + t * dx,
        y: start.y + t * dy,
    };

    return {
        distance: distance(point, closest),
        closest,
    };
}

/**
 * Check circle-circle collision
 */
export function circleCircleCollision(
    c1: Point & { radius: number },
    c2: Point & { radius: number }
): boolean {
    return distance(c1, c2) < c1.radius + c2.radius;
}

/**
 * Check if circle collides with line segment
 */
export function circleSegmentCollision(
    circle: Point & { radius: number },
    segment: LineSegment
): { collides: boolean; point?: Point; normal?: Vector2D } {
    const result = pointToSegmentDistance(circle, segment);

    if (result.distance < circle.radius) {
        // Calculate normal (perpendicular to segment, pointing toward circle)
        const nx = circle.x - result.closest.x;
        const ny = circle.y - result.closest.y;
        const len = Math.sqrt(nx * nx + ny * ny) || 1;

        return {
            collides: true,
            point: result.closest,
            normal: { x: nx / len, y: ny / len },
        };
    }

    return { collides: false };
}

/**
 * Reflect velocity off a surface normal with damping
 */
export function reflectVelocity(
    velocity: Vector2D,
    normal: Vector2D,
    damping: number = PHYSICS.BOUNCE_DAMPING
): Vector2D {
    const dot = velocity.x * normal.x + velocity.y * normal.y;

    return {
        x: (velocity.x - 2 * dot * normal.x) * damping,
        y: (velocity.y - 2 * dot * normal.y) * damping,
    };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Normalize a vector to unit length
 */
export function normalize(v: Vector2D): Vector2D {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}

/**
 * Check if point is inside rectangle
 */
export function pointInRect(
    point: Point,
    rect: { x: number; y: number; width: number; height: number }
): boolean {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

/**
 * Simplify polyline by removing points that are too close together
 */
export function simplifyPolyline(points: Point[], minDistance: number = 3): Point[] {
    if (points.length < 2) return points;

    const result: Point[] = [points[0]];

    for (let i = 1; i < points.length; i++) {
        if (distance(result[result.length - 1], points[i]) >= minDistance) {
            result.push(points[i]);
        }
    }

    // Always include the last point
    if (result[result.length - 1] !== points[points.length - 1]) {
        result.push(points[points.length - 1]);
    }

    return result;
}
