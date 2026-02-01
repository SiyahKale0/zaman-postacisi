import { create } from 'zustand';
import {
    GameState,
    Level,
    Point,
    PackageState,
    GamePhase,
    LineSegment,
    PHYSICS,
    GAME_CONFIG
} from '../types';
import { pointsToSegments, polylineLength, simplifyPolyline } from '../engine/geometry';

interface GameStore {
    // Current level
    currentLevel: Level | null;

    // Game state
    gameState: GameState;

    // Actions
    loadLevel: (level: Level) => void;
    startDrawing: () => void;
    addPoint: (point: Point) => void;
    finishDrawing: () => void;
    startSimulation: () => void;
    updatePackage: (pkg: PackageState) => void;
    setPhase: (phase: GamePhase) => void;
    reset: () => void;
}

const initialPackage: PackageState = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: PHYSICS.PACKAGE_RADIUS,
    isActive: false,
};

const initialGameState: GameState = {
    phase: 'idle',
    inkUsed: 0,
    inkLimit: GAME_CONFIG.INK_DEFAULT,
    package: initialPackage,
    drawnPath: [],
    drawnSegments: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
    currentLevel: null,
    gameState: initialGameState,

    loadLevel: (level: Level) => {
        set({
            currentLevel: level,
            gameState: {
                ...initialGameState,
                inkLimit: level.inkLimit,
                package: {
                    ...initialPackage,
                    x: level.start.x,
                    y: level.start.y,
                },
            },
        });
    },

    startDrawing: () => {
        const { gameState } = get();
        if (gameState.phase !== 'idle') return;

        set({
            gameState: {
                ...gameState,
                phase: 'drawing',
                drawnPath: [],
                drawnSegments: [],
                inkUsed: 0,
            },
        });
    },

    addPoint: (point: Point) => {
        const { gameState } = get();
        if (gameState.phase !== 'drawing') return;

        const newPath = [...gameState.drawnPath, point];
        const inkUsed = polylineLength(newPath);

        // Check ink limit
        if (inkUsed > gameState.inkLimit) {
            // Auto-finish if ink is exhausted
            get().finishDrawing();
            return;
        }

        set({
            gameState: {
                ...gameState,
                drawnPath: newPath,
                inkUsed,
            },
        });
    },

    finishDrawing: () => {
        const { gameState } = get();
        if (gameState.phase !== 'drawing') return;

        // Simplify the path and convert to segments
        const simplifiedPath = simplifyPolyline(gameState.drawnPath, 5);
        const segments = pointsToSegments(simplifiedPath);

        set({
            gameState: {
                ...gameState,
                phase: 'idle',
                drawnPath: simplifiedPath,
                drawnSegments: segments,
            },
        });
    },

    startSimulation: () => {
        const { gameState, currentLevel } = get();
        if (!currentLevel || gameState.drawnSegments.length === 0) return;

        set({
            gameState: {
                ...gameState,
                phase: 'simulating',
                package: {
                    ...gameState.package,
                    isActive: true,
                    vx: 0,
                    vy: 0,
                },
            },
        });
    },

    updatePackage: (pkg: PackageState) => {
        const { gameState } = get();
        set({
            gameState: {
                ...gameState,
                package: pkg,
            },
        });
    },

    setPhase: (phase: GamePhase) => {
        const { gameState } = get();
        set({
            gameState: {
                ...gameState,
                phase,
            },
        });
    },

    reset: () => {
        const { currentLevel } = get();
        if (!currentLevel) return;

        set({
            gameState: {
                ...initialGameState,
                inkLimit: currentLevel.inkLimit,
                package: {
                    ...initialPackage,
                    x: currentLevel.start.x,
                    y: currentLevel.start.y,
                },
            },
        });
    },
}));
