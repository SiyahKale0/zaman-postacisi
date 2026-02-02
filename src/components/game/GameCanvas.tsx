import React, { useCallback } from 'react';
import {
    Canvas,
    Path,
    Circle,
    Group,
    Skia,
    Line,
    vec,
    DashPathEffect,
} from '@shopify/react-native-skia';

import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useGameStore } from '../../stores/gameStore';
import { GAME_CONFIG, PHYSICS, Point, Obstacle } from '../../types';
import {
    COLORS,
    createEnvelopePath,
    createEnvelopeFlapPath,
    createEnvelopeStampPath,
    createMailboxPath,
    createMailboxDoorPath,
    createMailboxFlagPath,
    createSpringPath,
    createBounceArrowPath,
    createWindIndicatorPaths,
    createPortalPath,
    createPortalInnerPath,
    createPortalCorePath,
    createPortalConnectionPath,
    createMinimalSpikePath,
    createPlatformPath,
    createGlassPath,
    createGlassCrackPath,
    createStartIndicatorPath,
} from './GameAssets';

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

    // Render obstacle based on type
    const renderObstacle = (obstacle: Obstacle, index: number) => {
        switch (obstacle.type) {
            case 'spike':
                return (
                    <Group key={`spike-${index}`}>
                        {/* Ana spike */}
                        <Path
                            path={createMinimalSpikePath(
                                obstacle.x,
                                obstacle.y,
                                obstacle.width,
                                obstacle.height,
                                obstacle.rotation || 0
                            )}
                            color={COLORS.spike}
                            style="fill"
                        />
                        {/* İnce vurgulu kenar */}
                        <Path
                            path={createMinimalSpikePath(
                                obstacle.x + obstacle.width * 0.25,
                                obstacle.y + obstacle.height * 0.15,
                                obstacle.width * 0.5,
                                obstacle.height * 0.7,
                                obstacle.rotation || 0
                            )}
                            color={COLORS.spikeLight}
                            style="stroke"
                            strokeWidth={1}
                        />
                    </Group>
                );

            case 'fan':
                const windPaths = createWindIndicatorPaths(
                    obstacle.x,
                    obstacle.y,
                    obstacle.forceX,
                    obstacle.forceY,
                    obstacle.radius
                );
                return (
                    <Group key={`fan-${index}`}>
                        {/* Rüzgar alanı */}
                        <Circle
                            cx={obstacle.x}
                            cy={obstacle.y}
                            r={obstacle.radius}
                            color="rgba(127, 161, 183, 0.12)"
                            style="fill"
                        />
                        {/* Rüzgar çizgileri */}
                        {windPaths.map((windPath, i) => (
                            <Path
                                key={`wind-${index}-${i}`}
                                path={windPath}
                                color={COLORS.fan}
                                style="stroke"
                                strokeWidth={1.5}
                                strokeCap="round"
                            />
                        ))}
                    </Group>
                );

            case 'bounce':
                return (
                    <Group key={`bounce-${index}`}>
                        {/* Yay gövdesi */}
                        <Path
                            path={createSpringPath(
                                obstacle.x,
                                obstacle.y,
                                obstacle.width,
                                obstacle.height
                            )}
                            color={COLORS.bounce}
                            style="stroke"
                            strokeWidth={2}
                            strokeCap="round"
                        />
                        {/* Zıplama oku */}
                        <Path
                            path={createBounceArrowPath(obstacle.x, obstacle.y, obstacle.width)}
                            color={COLORS.bounceSpring}
                            style="fill"
                        />
                        {/* Taban */}
                        <Line
                            p1={vec(obstacle.x, obstacle.y + obstacle.height)}
                            p2={vec(obstacle.x + obstacle.width, obstacle.y + obstacle.height)}
                            color={COLORS.bounce}
                            strokeWidth={3}
                        />
                    </Group>
                );

            case 'teleport':
                return (
                    <Group key={`teleport-${index}`}>
                        {/* Bağlantı çizgisi */}
                        <Path
                            path={createPortalConnectionPath(
                                obstacle.x,
                                obstacle.y,
                                obstacle.exitX,
                                obstacle.exitY
                            )}
                            color={COLORS.teleportGlow}
                            style="stroke"
                            strokeWidth={1.5}
                        >
                            <DashPathEffect intervals={[8, 4]} />
                        </Path>

                        {/* Giriş portalı */}
                        <Circle
                            cx={obstacle.x}
                            cy={obstacle.y}
                            r={obstacle.radius}
                            color={COLORS.teleportGlow}
                            style="fill"
                        />
                        <Path
                            path={createPortalPath(obstacle.x, obstacle.y, obstacle.radius)}
                            color={COLORS.teleportEntry}
                            style="stroke"
                            strokeWidth={2}
                        />
                        <Path
                            path={createPortalInnerPath(obstacle.x, obstacle.y, obstacle.radius)}
                            color={COLORS.teleportEntry}
                            style="stroke"
                            strokeWidth={2}
                        />
                        <Path
                            path={createPortalCorePath(obstacle.x, obstacle.y, obstacle.radius)}
                            color={COLORS.teleportEntry}
                            style="fill"
                        />

                        {/* Çıkış portalı */}
                        <Circle
                            cx={obstacle.exitX}
                            cy={obstacle.exitY}
                            r={obstacle.radius * 0.8}
                            color={COLORS.teleportGlow}
                            style="fill"
                        />
                        <Path
                            path={createPortalPath(obstacle.exitX, obstacle.exitY, obstacle.radius * 0.8)}
                            color={COLORS.teleportExit}
                            style="stroke"
                            strokeWidth={1.5}
                        />
                        <Path
                            path={createPortalCorePath(obstacle.exitX, obstacle.exitY, obstacle.radius * 0.8)}
                            color={COLORS.teleportExit}
                            style="fill"
                        />
                    </Group>
                );

            case 'platform':
                return (
                    <Path
                        key={`platform-${index}`}
                        path={createPlatformPath(
                            obstacle.x,
                            obstacle.y,
                            obstacle.width,
                            obstacle.height
                        )}
                        color={COLORS.platform}
                        style="fill"
                    />
                );

            case 'glass':
                return (
                    <Group key={`glass-${index}`}>
                        <Path
                            path={createGlassPath(
                                obstacle.x,
                                obstacle.y,
                                obstacle.width,
                                obstacle.height
                            )}
                            color={COLORS.glass}
                            style="fill"
                        />
                        <Path
                            path={createGlassPath(
                                obstacle.x,
                                obstacle.y,
                                obstacle.width,
                                obstacle.height
                            )}
                            color={COLORS.glassEdge}
                            style="stroke"
                            strokeWidth={1}
                        />
                        <Path
                            path={createGlassCrackPath(
                                obstacle.x,
                                obstacle.y,
                                obstacle.width,
                                obstacle.height
                            )}
                            color="rgba(255, 255, 255, 0.3)"
                            style="stroke"
                            strokeWidth={1}
                        />
                    </Group>
                );

            default:
                return null;
        }
    };

    if (!currentLevel) return null;

    const inkPercentage = (gameState.inkUsed / gameState.inkLimit) * 100;
    const inkColor = inkPercentage > 80
        ? COLORS.inkDanger
        : inkPercentage > 50
            ? COLORS.inkWarning
            : COLORS.ink;

    return (
        <View style={styles.container}>
            <GestureDetector gesture={drawGesture}>
                <Canvas style={styles.canvas}>

                    {/* Hedef - Posta Kutusu */}
                    <Group>
                        {/* Ana gövde */}
                        <Path
                            path={createMailboxPath(
                                currentLevel.goal.x,
                                currentLevel.goal.y,
                                currentLevel.goal.radius
                            )}
                            color={COLORS.mailbox}
                            style="fill"
                        />
                        {/* Minimal üst vurgusu */}
                        <Path
                            path={createMailboxPath(
                                currentLevel.goal.x,
                                currentLevel.goal.y - 3,
                                currentLevel.goal.radius * 0.85
                            )}
                            color={COLORS.mailboxLight}
                            style="fill"
                        />
                        {/* Kapak/Ağız */}
                        <Path
                            path={createMailboxDoorPath(
                                currentLevel.goal.x,
                                currentLevel.goal.y,
                                currentLevel.goal.radius
                            )}
                            color={COLORS.backgroundLight}
                            style="fill"
                        />
                        {/* Bayrak */}
                        <Path
                            path={createMailboxFlagPath(
                                currentLevel.goal.x,
                                currentLevel.goal.y,
                                currentLevel.goal.radius
                            )}
                            color={COLORS.mailboxFlag}
                            style="stroke"
                            strokeWidth={2}
                            strokeCap="round"
                        />
                    </Group>

                    {/* Engeller */}
                    {currentLevel.obstacles.map((obstacle, index) =>
                        renderObstacle(obstacle, index)
                    )}

                    {/* Çizilen Çizgi */}
                    <Path
                        path={getDrawnPath()}
                        color={inkColor}
                        style="stroke"
                        strokeWidth={4}
                        strokeCap="round"
                        strokeJoin="round"
                    />

                    {/* Paket - Zarf */}
                    <Group>
                        {/* Ana zarf */}
                        <Path
                            path={createEnvelopePath(
                                gameState.package.x,
                                gameState.package.y,
                                gameState.package.radius * 2
                            )}
                            color={COLORS.envelope}
                            style="fill"
                        />
                        {/* Zarf gölgesi (alt) */}
                        <Path
                            path={createEnvelopePath(
                                gameState.package.x,
                                gameState.package.y + 2,
                                gameState.package.radius * 1.8
                            )}
                            color={COLORS.envelopeShadow}
                            style="fill"
                        />
                        {/* Üst kapak çizgisi */}
                        <Path
                            path={createEnvelopeFlapPath(
                                gameState.package.x,
                                gameState.package.y,
                                gameState.package.radius * 2
                            )}
                            color={COLORS.envelopeShadow}
                            style="stroke"
                            strokeWidth={1.2}
                        />
                        {/* Pul */}
                        <Path
                            path={createEnvelopeStampPath(
                                gameState.package.x,
                                gameState.package.y,
                                gameState.package.radius * 2
                            )}
                            color={COLORS.seal}
                            style="fill"
                        />
                        <Circle
                            cx={gameState.package.x + gameState.package.radius * 0.42}
                            cy={gameState.package.y - gameState.package.radius * 0.42}
                            r={2}
                            color={COLORS.sealLight}
                            style="fill"
                        />
                    </Group>

                    {/* Başlangıç noktası göstergesi */}
                    {gameState.phase === 'idle' && (
                        <Group>
                            <Circle
                                cx={currentLevel.start.x}
                                cy={currentLevel.start.y}
                                r={20}
                                color="rgba(232, 226, 214, 0.15)"
                                style="stroke"
                                strokeWidth={1.5}
                            />
                            <Circle
                                cx={currentLevel.start.x}
                                cy={currentLevel.start.y}
                                r={12}
                                color="rgba(232, 226, 214, 0.25)"
                                style="fill"
                            />
                        </Group>
                    )}
                </Canvas>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    canvas: {
        width: SCREEN_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: COLORS.background,
    },
});

export default GameCanvas;
