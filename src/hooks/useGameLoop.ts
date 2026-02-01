import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { physicsStep } from '../engine/physics';
import { GAME_CONFIG } from '../types';

interface UseGameLoopOptions {
    onWin?: () => void;
    onFail?: (reason: 'spike' | 'outOfBounds') => void;
}

export function useGameLoop({ onWin, onFail }: UseGameLoopOptions = {}) {
    const {
        gameState,
        currentLevel,
        updatePackage,
        setPhase
    } = useGameStore();

    const frameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    const gameLoop = useCallback((timestamp: number) => {
        if (!currentLevel) return;

        // Throttle to ~60fps
        const deltaTime = timestamp - lastTimeRef.current;
        if (deltaTime < 16) {
            frameRef.current = requestAnimationFrame(gameLoop);
            return;
        }
        lastTimeRef.current = timestamp;

        const result = physicsStep(
            gameState.package,
            gameState.drawnSegments,
            currentLevel.obstacles,
            currentLevel.goal,
            { width: GAME_CONFIG.CANVAS_WIDTH, height: GAME_CONFIG.CANVAS_HEIGHT }
        );

        updatePackage(result.state);

        if (result.won) {
            setPhase('win');
            onWin?.();
            return;
        }

        if (result.failed) {
            setPhase('fail');
            onFail?.(result.reason || 'outOfBounds');
            return;
        }

        frameRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, currentLevel, updatePackage, setPhase, onWin, onFail]);

    useEffect(() => {
        if (gameState.phase === 'simulating' && gameState.package.isActive) {
            lastTimeRef.current = performance.now();
            frameRef.current = requestAnimationFrame(gameLoop);
        }

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [gameState.phase, gameState.package.isActive, gameLoop]);

    return {
        isSimulating: gameState.phase === 'simulating',
        isWin: gameState.phase === 'win',
        isFail: gameState.phase === 'fail',
    };
}
