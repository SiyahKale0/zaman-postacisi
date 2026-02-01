import React, { useCallback } from 'react';
import {
    Canvas,
    Path,
    Circle,
    Group,
    Skia,
} from '@shopify/react-native-skia';

import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useGameStore } from '../../stores/gameStore';
import { GAME_CONFIG, PHYSICS, Point } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_HEIGHT = SCREEN_HEIGHT * 0.75;

export const GameCanvas: React.FC = () => {
    const {
        gameState,
        currentLevel,
        addPoint,
        startDrawing,
        finishDrawing
    } = useGameStore();

    // Wrapper functions for JS thread execution
    const handleStartDrawing = useCallback((x: number, y: number) => {
        startDrawing();
        addPoint({ x, y });
    }, [startDrawing, addPoint]);

    const handleAddPoint = useCallback((x: number, y: number) => {
        addPoint({ x, y });
    }, [addPoint]);

    const handleFinishDrawing = useCallback(() => {
        finishDrawing();
    }, [finishDrawing]);

    // Drawing gesture
    const drawGesture = Gesture.Pan()
        .onStart((e) => {
            if (gameState.phase === 'idle') {
                runOnJS(handleStartDrawing)(e.x, e.y);
            }
        })
        .onUpdate((e) => {
            if (gameState.phase === 'drawing') {
                runOnJS(handleAddPoint)(e.x, e.y);
            }
        })
        .onEnd(() => {
            if (gameState.phase === 'drawing') {
                runOnJS(handleFinishDrawing)();
            }
        });

    // Build drawn path for Skia
    const getDrawnPath = () => {
        const path = Skia.Path.Make();
        const points = gameState.drawnPath;

        if (points.length < 2) return path;

        path.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            path.lineTo(points[i].x, points[i].y);
        }

        return path;
    };

    if (!currentLevel) return null;

    const inkPercentage = (gameState.inkUsed / gameState.inkLimit) * 100;
    const inkColor = inkPercentage > 80 ? '#ff4444' : inkPercentage > 50 ? '#ffaa00' : '#4488ff';

    return (
        <View style={styles.container}>
            <GestureDetector gesture={drawGesture}>
                <Canvas style={styles.canvas}>
                    {/* Background gradient could go here */}

                    {/* Goal (Mailbox) */}
                    <Circle
                        cx={currentLevel.goal.x}
                        cy={currentLevel.goal.y}
                        r={currentLevel.goal.radius}
                        color="#22cc55"
                        style="fill"
                    />
                    <Circle
                        cx={currentLevel.goal.x}
                        cy={currentLevel.goal.y}
                        r={currentLevel.goal.radius - 4}
                        color="#44ff77"
                        style="fill"
                    />

                    {/* Obstacles */}
                    {currentLevel.obstacles.map((obstacle, index) => {
                        if (obstacle.type === 'spike') {
                            return (
                                <Group key={`spike-${index}`}>
                                    {/* Spike triangle - simplified as rectangle for now */}
                                    <Path
                                        path={createSpikePath(obstacle)}
                                        color="#ff4444"
                                        style="fill"
                                    />
                                </Group>
                            );
                        }

                        if (obstacle.type === 'fan') {
                            return (
                                <Circle
                                    key={`fan-${index}`}
                                    cx={obstacle.x}
                                    cy={obstacle.y}
                                    r={obstacle.radius}
                                    color="rgba(100, 200, 255, 0.3)"
                                    style="fill"
                                />
                            );
                        }

                        if (obstacle.type === 'bounce') {
                            return (
                                <Path
                                    key={`bounce-${index}`}
                                    path={createBouncePath(obstacle)}
                                    color="#ffcc00"
                                    style="fill"
                                />
                            );
                        }

                        return null;
                    })}

                    {/* Drawn Line */}
                    <Path
                        path={getDrawnPath()}
                        color={inkColor}
                        style="stroke"
                        strokeWidth={4}
                        strokeCap="round"
                        strokeJoin="round"
                    />

                    {/* Package */}
                    <Circle
                        cx={gameState.package.x}
                        cy={gameState.package.y}
                        r={gameState.package.radius}
                        color="#8855ff"
                        style="fill"
                    />
                    <Circle
                        cx={gameState.package.x}
                        cy={gameState.package.y}
                        r={gameState.package.radius - 3}
                        color="#aa77ff"
                        style="fill"
                    />

                    {/* Start position indicator */}
                    {gameState.phase === 'idle' && (
                        <Circle
                            cx={currentLevel.start.x}
                            cy={currentLevel.start.y}
                            r={18}
                            color="rgba(136, 85, 255, 0.3)"
                            style="fill"
                        />
                    )}
                </Canvas>
            </GestureDetector>
        </View>
    );
};

// Helper to create spike path
function createSpikePath(spike: { x: number; y: number; width: number; height: number }) {
    const path = Skia.Path.Make();
    const { x, y, width, height } = spike;

    // Triangle pointing up
    path.moveTo(x + width / 2, y);
    path.lineTo(x + width, y + height);
    path.lineTo(x, y + height);
    path.close();

    return path;
}

// Helper to create bounce pad path
function createBouncePath(bounce: { x: number; y: number; width: number; height: number }) {
    const path = Skia.Path.Make();
    const { x, y, width, height } = bounce;

    // Rounded rectangle (simplified)
    path.addRRect({
        rect: { x, y, width, height },
        rx: 5,
        ry: 5,
    });

    return path;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    canvas: {
        width: SCREEN_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: '#1a1a2e',
    },
});

export default GameCanvas;
