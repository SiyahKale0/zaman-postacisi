import { PackageState, Vector2D, LineSegment, Obstacle, PHYSICS } from '../types';
import {
    circleSegmentCollision,
    reflectVelocity,
    clamp,
    distance,
    pointInRect
} from './geometry';

/**
 * Apply gravity to package velocity
 */
export function applyGravity(state: PackageState, gravity: number = PHYSICS.GRAVITY): PackageState {
    return {
        ...state,
        vy: state.vy + gravity,
    };
}

/**
 * Update package position based on velocity
 */
export function updatePosition(state: PackageState): PackageState {
    return {
        ...state,
        x: state.x + state.vx,
        y: state.y + state.vy,
    };
}

/**
 * Clamp velocity to maximum
 */
export function clampVelocity(state: PackageState, maxVel: number = PHYSICS.MAX_VELOCITY): PackageState {
    const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);

    if (speed > maxVel) {
        const scale = maxVel / speed;
        return {
            ...state,
            vx: state.vx * scale,
            vy: state.vy * scale,
        };
    }

    return state;
}

/**
 * Apply friction to slow down package slightly
 */
export function applyFriction(state: PackageState, friction: number = PHYSICS.FRICTION): PackageState {
    return {
        ...state,
        vx: state.vx * friction,
        vy: state.vy * friction,
    };
}

/**
 * Check collision with drawn line segments and bounce
 */
export function handleLineCollisions(
    state: PackageState,
    segments: LineSegment[]
): { state: PackageState; bounced: boolean } {
    let newState = { ...state };
    let bounced = false;

    for (const segment of segments) {
        const collision = circleSegmentCollision(
            { x: newState.x, y: newState.y, radius: newState.radius },
            segment
        );

        if (collision.collides && collision.normal) {
            // Move package out of collision
            const overlap = newState.radius - distance(
                { x: newState.x, y: newState.y },
                collision.point!
            );

            newState.x += collision.normal.x * (overlap + 1);
            newState.y += collision.normal.y * (overlap + 1);

            // Reflect velocity
            const newVel = reflectVelocity(
                { x: newState.vx, y: newState.vy },
                collision.normal
            );

            newState.vx = newVel.x;
            newState.vy = newVel.y;
            bounced = true;
        }
    }

    return { state: newState, bounced };
}

/**
 * Check if package reached the goal
 */
export function checkGoalReached(
    state: PackageState,
    goal: { x: number; y: number; radius: number }
): boolean {
    const dist = distance(
        { x: state.x, y: state.y },
        { x: goal.x, y: goal.y }
    );
    return dist < goal.radius + state.radius;
}

/**
 * Check if package is out of bounds
 */
export function isOutOfBounds(
    state: PackageState,
    bounds: { width: number; height: number }
): boolean {
    const margin = 50; // Allow some margin for off-screen
    return (
        state.x < -margin ||
        state.x > bounds.width + margin ||
        state.y < -margin ||
        state.y > bounds.height + margin
    );
}

/**
 * Handle obstacle interactions
 */
export function handleObstacles(
    state: PackageState,
    obstacles: Obstacle[]
): { state: PackageState; hitSpike: boolean; teleported: boolean } {
    let newState = { ...state };
    let hitSpike = false;
    let teleported = false;

    for (const obstacle of obstacles) {
        switch (obstacle.type) {
            case 'spike':
                if (checkSpikeCollision(newState, obstacle)) {
                    hitSpike = true;
                }
                break;

            case 'fan':
                newState = applyFanForce(newState, obstacle);
                break;

            case 'bounce':
                const bounceResult = handleBounceCollision(newState, obstacle);
                newState = bounceResult.state;
                break;

            case 'teleport':
                const teleportResult = handleTeleport(newState, obstacle);
                if (teleportResult.teleported) {
                    newState = teleportResult.state;
                    teleported = true;
                }
                break;

            case 'platform':
                // Platform collision handled in line collision
                break;

            case 'glass':
                // Glass breaks after first contact
                break;
        }
    }

    return { state: newState, hitSpike, teleported };
}

function checkSpikeCollision(
    state: PackageState,
    spike: { x: number; y: number; width: number; height: number }
): boolean {
    // Simple AABB check with circle
    const closestX = clamp(state.x, spike.x, spike.x + spike.width);
    const closestY = clamp(state.y, spike.y, spike.y + spike.height);

    const dist = distance(
        { x: state.x, y: state.y },
        { x: closestX, y: closestY }
    );

    return dist < state.radius;
}

function applyFanForce(
    state: PackageState,
    fan: { x: number; y: number; forceX: number; forceY: number; radius: number }
): PackageState {
    const dist = distance(
        { x: state.x, y: state.y },
        { x: fan.x, y: fan.y }
    );

    if (dist < fan.radius) {
        // Force decreases with distance
        const strength = 1 - (dist / fan.radius);
        return {
            ...state,
            vx: state.vx + fan.forceX * strength,
            vy: state.vy + fan.forceY * strength,
        };
    }

    return state;
}

function handleBounceCollision(
    state: PackageState,
    bounce: { x: number; y: number; width: number; height: number; power: number }
): { state: PackageState; bounced: boolean } {
    const closestX = clamp(state.x, bounce.x, bounce.x + bounce.width);
    const closestY = clamp(state.y, bounce.y, bounce.y + bounce.height);

    const dist = distance(
        { x: state.x, y: state.y },
        { x: closestX, y: closestY }
    );

    if (dist < state.radius) {
        // Bounce upward with power
        return {
            state: {
                ...state,
                vy: -Math.abs(state.vy) * bounce.power - 5,
            },
            bounced: true,
        };
    }

    return { state, bounced: false };
}

function handleTeleport(
    state: PackageState,
    teleport: { x: number; y: number; exitX: number; exitY: number; radius: number }
): { state: PackageState; teleported: boolean } {
    const dist = distance(
        { x: state.x, y: state.y },
        { x: teleport.x, y: teleport.y }
    );

    if (dist < teleport.radius) {
        return {
            state: {
                ...state,
                x: teleport.exitX,
                y: teleport.exitY,
            },
            teleported: true,
        };
    }

    return { state, teleported: false };
}

/**
 * Single physics step - call this every frame
 */
export function physicsStep(
    state: PackageState,
    segments: LineSegment[],
    obstacles: Obstacle[],
    goal: { x: number; y: number; radius: number },
    bounds: { width: number; height: number }
): {
    state: PackageState;
    won: boolean;
    failed: boolean;
    reason?: 'spike' | 'outOfBounds';
} {
    if (!state.isActive) {
        return { state, won: false, failed: false };
    }

    // Apply physics
    let newState = applyGravity(state);
    newState = updatePosition(newState);
    newState = clampVelocity(newState);
    newState = applyFriction(newState);

    // Handle collisions with drawn lines
    const lineResult = handleLineCollisions(newState, segments);
    newState = lineResult.state;

    // Handle obstacles
    const obstacleResult = handleObstacles(newState, obstacles);
    newState = obstacleResult.state;

    // Check win condition
    if (checkGoalReached(newState, goal)) {
        return { state: { ...newState, isActive: false }, won: true, failed: false };
    }

    // Check fail conditions
    if (obstacleResult.hitSpike) {
        return { state: { ...newState, isActive: false }, won: false, failed: true, reason: 'spike' };
    }

    if (isOutOfBounds(newState, bounds)) {
        return { state: { ...newState, isActive: false }, won: false, failed: true, reason: 'outOfBounds' };
    }

    return { state: newState, won: false, failed: false };
}
