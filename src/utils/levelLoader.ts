import { Level, WorldType } from '../types';

// Import level data
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

// Level registry
const levelRegistry: Record<string, Level[]> = {
    stone_age: [
        level001 as Level,
        level002 as Level,
        level003 as Level,
        level004 as Level,
        level005 as Level,
        level006 as Level,
        level007 as Level,
        level008 as Level,
        level009 as Level,
        level010 as Level,
    ],
    medieval: [],
    ottoman_steam: [],
    neon_cyber: [],
    mars: [],
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
