// Core Types
export interface Point {
    x: number;
    y: number;
}

export interface Vector2D {
    x: number;
    y: number;
}

export interface LineSegment {
    start: Point;
    end: Point;
}

// Level Types
export type ObstacleType = 'spike' | 'fan' | 'bounce' | 'teleport' | 'platform' | 'glass';

export interface BaseObstacle {
    type: ObstacleType;
    x: number;
    y: number;
}

export interface SpikeObstacle extends BaseObstacle {
    type: 'spike';
    width: number;
    height: number;
    rotation?: number;
}

export interface FanObstacle extends BaseObstacle {
    type: 'fan';
    forceX: number;
    forceY: number;
    radius: number;
}

export interface BounceObstacle extends BaseObstacle {
    type: 'bounce';
    width: number;
    height: number;
    power: number;
}

export interface TeleportObstacle extends BaseObstacle {
    type: 'teleport';
    exitX: number;
    exitY: number;
    radius: number;
}

export interface PlatformObstacle extends BaseObstacle {
    type: 'platform';
    width: number;
    height: number;
    moveX?: number;
    moveY?: number;
    speed?: number;
}

export interface GlassObstacle extends BaseObstacle {
    type: 'glass';
    width: number;
    height: number;
}

export type Obstacle =
    | SpikeObstacle
    | FanObstacle
    | BounceObstacle
    | TeleportObstacle
    | PlatformObstacle
    | GlassObstacle;

// Level Definition
export interface Level {
    id: number;
    world: WorldType;
    name: string;
    inkLimit: number;
    start: Point;
    goal: {
        x: number;
        y: number;
        radius: number;
    };
    obstacles: Obstacle[];
    stars?: {
        twoStar: number; // ink usage threshold
        threeStar: number;
    };
}

export type WorldType =
    | 'stone_age'
    | 'medieval'
    | 'ottoman_steam'
    | 'neon_cyber'
    | 'mars';

// Game State
export type GamePhase = 'idle' | 'drawing' | 'simulating' | 'win' | 'fail';

export interface PackageState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    isActive: boolean;
}

export interface GameState {
    phase: GamePhase;
    inkUsed: number;
    inkLimit: number;
    package: PackageState;
    drawnPath: Point[];
    drawnSegments: LineSegment[];
}

// Progress & Meta
export interface PlayerProgress {
    stamps: number; // Pul (soft currency)
    completedLevels: Record<string, LevelCompletion>;
    unlockedWorlds: WorldType[];
    upgrades: Upgrades;
    cosmetics: Cosmetics;
}

export interface LevelCompletion {
    completed: boolean;
    stars: number;
    bestInkUsed: number;
}

export interface Upgrades {
    inkExtension: number; // 0, 1, 2, 3 (0%, 5%, 10%, 15%)
    cargoShell: boolean;
    speedAdjust: number;
}

export interface Cosmetics {
    packageSkin: string;
    lineEffect: string;
    mailboxTheme: string;
}

// Navigation Types
export type RootStackParamList = {
    Menu: undefined;
    LevelSelect: { world: WorldType };
    Game: { levelId: number; world: WorldType };
    Album: undefined;
    Settings: undefined;
    Shop: undefined;
};

// Constants
export const PHYSICS = {
    GRAVITY: 0.5,
    MAX_VELOCITY: 15,
    PACKAGE_RADIUS: 12,
    BOUNCE_DAMPING: 0.7,
    FRICTION: 0.99,
} as const;

export const GAME_CONFIG = {
    CANVAS_WIDTH: 390,
    CANVAS_HEIGHT: 700,
    INK_DEFAULT: 300,
    STAMPS_PER_LEVEL: 10,
    STAMPS_PER_STAR: 5,
} as const;
