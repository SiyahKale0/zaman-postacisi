import { Level, WorldType, GAME_CONFIG } from '../types';

// Import Stone Age level data
import level001 from '../data/levels/world1/level_001.json';
import level002 from '../data/levels/world1/level_002.json';
import level003 from '../data/levels/world1/level_003.json';
import level004 from '../data/levels/world1/level_004.json';
import level005 from '../data/levels/world1/level_005.json';
import level006 from '../data/levels/world1/level_006.json';
import level007 from '../data/levels/world1/level_007.json';
import level008 from '../data/levels/world1/level_008.json';
import level009 from '../data/levels/world1/level_009.json';
import level010 from '../data/levels/world1/level_010.json';

// Import Medieval level data
import medieval001 from '../data/levels/world2/level_001.json';
import medieval002 from '../data/levels/world2/level_002.json';
import medieval003 from '../data/levels/world2/level_003.json';
import medieval004 from '../data/levels/world2/level_004.json';
import medieval005 from '../data/levels/world2/level_005.json';
import medieval006 from '../data/levels/world2/level_006.json';
import medieval007 from '../data/levels/world2/level_007.json';
import medieval008 from '../data/levels/world2/level_008.json';
import medieval009 from '../data/levels/world2/level_009.json';
import medieval010 from '../data/levels/world2/level_010.json';

// Import Ottoman Steam level data
import ottoman001 from '../data/levels/world3/level_001.json';
import ottoman002 from '../data/levels/world3/level_002.json';
import ottoman003 from '../data/levels/world3/level_003.json';
import ottoman004 from '../data/levels/world3/level_004.json';
import ottoman005 from '../data/levels/world3/level_005.json';
import ottoman006 from '../data/levels/world3/level_006.json';
import ottoman007 from '../data/levels/world3/level_007.json';
import ottoman008 from '../data/levels/world3/level_008.json';
import ottoman009 from '../data/levels/world3/level_009.json';
import ottoman010 from '../data/levels/world3/level_010.json';

// Import Neon Cyber level data
import neon001 from '../data/levels/world4/level_001.json';
import neon002 from '../data/levels/world4/level_002.json';
import neon003 from '../data/levels/world4/level_003.json';
import neon004 from '../data/levels/world4/level_004.json';
import neon005 from '../data/levels/world4/level_005.json';
import neon006 from '../data/levels/world4/level_006.json';
import neon007 from '../data/levels/world4/level_007.json';
import neon008 from '../data/levels/world4/level_008.json';
import neon009 from '../data/levels/world4/level_009.json';
import neon010 from '../data/levels/world4/level_010.json';

// Import Mars level data
import mars001 from '../data/levels/world5/level_001.json';
import mars002 from '../data/levels/world5/level_002.json';
import mars003 from '../data/levels/world5/level_003.json';
import mars004 from '../data/levels/world5/level_004.json';
import mars005 from '../data/levels/world5/level_005.json';
import mars006 from '../data/levels/world5/level_006.json';
import mars007 from '../data/levels/world5/level_007.json';
import mars008 from '../data/levels/world5/level_008.json';
import mars009 from '../data/levels/world5/level_009.json';
import mars010 from '../data/levels/world5/level_010.json';

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

const sanitizeLevel = (level: Level): Level => {
    const width = GAME_CONFIG.CANVAS_WIDTH;
    const height = GAME_CONFIG.CANVAS_HEIGHT;

    const safeGoalRadius = clamp(level.goal.radius, 18, 60);

    const sanitizedObstacles = level.obstacles.map((obstacle) => {
        switch (obstacle.type) {
            case 'spike': {
                const w = Math.max(8, obstacle.width);
                const h = Math.max(8, obstacle.height);
                return {
                    ...obstacle,
                    width: w,
                    height: h,
                    x: clamp(obstacle.x, 0, width - w),
                    y: clamp(obstacle.y, 0, height - h),
                };
            }
            case 'fan': {
                const r = Math.max(16, obstacle.radius);
                return {
                    ...obstacle,
                    radius: r,
                    x: clamp(obstacle.x, r, width - r),
                    y: clamp(obstacle.y, r, height - r),
                };
            }
            case 'bounce': {
                const w = Math.max(24, obstacle.width);
                const h = Math.max(8, obstacle.height);
                return {
                    ...obstacle,
                    width: w,
                    height: h,
                    x: clamp(obstacle.x, 0, width - w),
                    y: clamp(obstacle.y, 0, height - h),
                };
            }
            case 'teleport': {
                const r = Math.max(18, obstacle.radius);
                return {
                    ...obstacle,
                    radius: r,
                    x: clamp(obstacle.x, r, width - r),
                    y: clamp(obstacle.y, r, height - r),
                    exitX: clamp(obstacle.exitX, r, width - r),
                    exitY: clamp(obstacle.exitY, r, height - r),
                };
            }
            case 'platform': {
                const w = Math.max(24, obstacle.width);
                const h = Math.max(8, obstacle.height);
                return {
                    ...obstacle,
                    width: w,
                    height: h,
                    x: clamp(obstacle.x, 0, width - w),
                    y: clamp(obstacle.y, 0, height - h),
                };
            }
            case 'glass': {
                const w = Math.max(24, obstacle.width);
                const h = Math.max(12, obstacle.height);
                return {
                    ...obstacle,
                    width: w,
                    height: h,
                    x: clamp(obstacle.x, 0, width - w),
                    y: clamp(obstacle.y, 0, height - h),
                };
            }
            default:
                return obstacle;
        }
    });

    return {
        ...level,
        start: {
            x: clamp(level.start.x, 20, width - 20),
            y: clamp(level.start.y, 20, height - 20),
        },
        goal: {
            ...level.goal,
            radius: safeGoalRadius,
            x: clamp(level.goal.x, safeGoalRadius, width - safeGoalRadius),
            y: clamp(level.goal.y, safeGoalRadius, height - safeGoalRadius),
        },
        obstacles: sanitizedObstacles,
    };
};

// Level registry
const levelRegistry: Record<string, Level[]> = {
    stone_age: [
        sanitizeLevel(level001 as Level),
        sanitizeLevel(level002 as Level),
        sanitizeLevel(level003 as Level),
        sanitizeLevel(level004 as Level),
        sanitizeLevel(level005 as Level),
        sanitizeLevel(level006 as Level),
        sanitizeLevel(level007 as Level),
        sanitizeLevel(level008 as Level),
        sanitizeLevel(level009 as Level),
        sanitizeLevel(level010 as Level),
    ],
    medieval: [
        sanitizeLevel(medieval001 as Level),
        sanitizeLevel(medieval002 as Level),
        sanitizeLevel(medieval003 as Level),
        sanitizeLevel(medieval004 as Level),
        sanitizeLevel(medieval005 as Level),
        sanitizeLevel(medieval006 as Level),
        sanitizeLevel(medieval007 as Level),
        sanitizeLevel(medieval008 as Level),
        sanitizeLevel(medieval009 as Level),
        sanitizeLevel(medieval010 as Level),
    ],
    ottoman_steam: [
        sanitizeLevel(ottoman001 as Level),
        sanitizeLevel(ottoman002 as Level),
        sanitizeLevel(ottoman003 as Level),
        sanitizeLevel(ottoman004 as Level),
        sanitizeLevel(ottoman005 as Level),
        sanitizeLevel(ottoman006 as Level),
        sanitizeLevel(ottoman007 as Level),
        sanitizeLevel(ottoman008 as Level),
        sanitizeLevel(ottoman009 as Level),
        sanitizeLevel(ottoman010 as Level),
    ],
    neon_cyber: [
        sanitizeLevel(neon001 as Level),
        sanitizeLevel(neon002 as Level),
        sanitizeLevel(neon003 as Level),
        sanitizeLevel(neon004 as Level),
        sanitizeLevel(neon005 as Level),
        sanitizeLevel(neon006 as Level),
        sanitizeLevel(neon007 as Level),
        sanitizeLevel(neon008 as Level),
        sanitizeLevel(neon009 as Level),
        sanitizeLevel(neon010 as Level),
    ],
    mars: [
        sanitizeLevel(mars001 as Level),
        sanitizeLevel(mars002 as Level),
        sanitizeLevel(mars003 as Level),
        sanitizeLevel(mars004 as Level),
        sanitizeLevel(mars005 as Level),
        sanitizeLevel(mars006 as Level),
        sanitizeLevel(mars007 as Level),
        sanitizeLevel(mars008 as Level),
        sanitizeLevel(mars009 as Level),
        sanitizeLevel(mars010 as Level),
    ],
};

// World metadata
export const worldMeta: Record<WorldType, { name: string; icon: string; color: string }> = {
    stone_age: {
        name: 'Taş Devri Şubesi',
        icon: '🦴',
        color: '#8B4513',
    },
    medieval: {
        name: 'Orta Çağ Şubesi',
        icon: '⚔️',
        color: '#4A4A4A',
    },
    ottoman_steam: {
        name: 'Osmanlı Steam Şubesi',
        icon: '⚙️',
        color: '#B8860B',
    },
    neon_cyber: {
        name: 'Neon Cyber Şubesi',
        icon: '🌆',
        color: '#FF00FF',
    },
    mars: {
        name: 'Mars Şubesi',
        icon: '🚀',
        color: '#FF4500',
    },
};

/**
 * Get all levels for a world
 */
export function getLevelsByWorld(world: WorldType): Level[] {
    return levelRegistry[world] || [];
}

/**
 * Get a specific level by world and level number
 */
export function getLevel(world: WorldType, levelId: number): Level | undefined {
    const levels = levelRegistry[world];
    return levels?.find(l => l.id === levelId);
}

/**
 * Get level key for storage
 */
export function getLevelKey(world: WorldType, levelId: number): string {
    return `${world}_${levelId}`;
}

/**
 * Get total level count across all worlds
 */
export function getTotalLevelCount(): number {
    return Object.values(levelRegistry).reduce(
        (total, levels) => total + levels.length,
        0
    );
}

/**
 * Get unlocked world count
 */
export function getWorldCount(): number {
    return Object.keys(levelRegistry).length;
}

/**
 * Calculate stars based on ink usage
 */
export function calculateStars(level: Level, inkUsed: number): number {
    if (!level.stars) return 1;

    if (inkUsed <= level.stars.threeStar) return 3;
    if (inkUsed <= level.stars.twoStar) return 2;
    return 1;
}
