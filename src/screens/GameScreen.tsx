import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Canvas, Circle, Path, Skia } from '@shopify/react-native-skia';

import { GameCanvas } from '../components/game/GameCanvas';
import { InkMeter } from '../components/ui/InkMeter';
import { useGameStore } from '../stores/gameStore';
import { useProgressStore } from '../stores/progressStore';
import { useSoundStore, useHaptics } from '../stores/soundStore';
import { useAchievementStore } from '../stores/achievementStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { getLevel, calculateStars, getLevelKey } from '../utils/levelLoader';
import { WorldType, Level } from '../types';
import { COLORS } from '../components/game/GameAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GameScreenProps {
    world: WorldType;
    levelId: number;
    onBack: () => void;
    onNextLevel: () => void;
}

// Minimal star icon
const StarIcon: React.FC<{ filled: boolean; size?: number }> = ({ filled, size = 32 }) => {
    const starPath = Skia.Path.Make();
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 2;
    const innerR = outerR * 0.4;

    for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * Math.PI / 180;
        const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;

        const ox = cx + Math.cos(outerAngle) * outerR;
        const oy = cy + Math.sin(outerAngle) * outerR;
        const ix = cx + Math.cos(innerAngle) * innerR;
        const iy = cy + Math.sin(innerAngle) * innerR;

        if (i === 0) {
            starPath.moveTo(ox, oy);
        } else {
            starPath.lineTo(ox, oy);
        }
        starPath.lineTo(ix, iy);
    }
    starPath.close();

    return (
        <Canvas style={{ width: size, height: size }}>
            <Path
                path={starPath}
                color={filled ? COLORS.bounceSpring : 'rgba(255, 255, 255, 0.15)'}
                style="fill"
            />
            <Path
                path={starPath}
                color={filled ? COLORS.bounce : 'rgba(255, 255, 255, 0.2)'}
                style="stroke"
                strokeWidth={1}
            />
        </Canvas>
    );
};

// Minimal envelope for result
const ResultEnvelope: React.FC<{ success: boolean }> = ({ success }) => {
    const size = 80;
    const w = size * 1.4;
    const h = size;
    const cx = w / 2;
    const cy = h / 2;

    const envPath = Skia.Path.Make();
    envPath.moveTo(cx - w / 2 + 10, cy - h / 2 + 10);
    envPath.lineTo(cx + w / 2 - 10, cy - h / 2 + 10);
    envPath.lineTo(cx + w / 2 - 10, cy + h / 2 - 10);
    envPath.lineTo(cx - w / 2 + 10, cy + h / 2 - 10);
    envPath.close();

    const flapPath = Skia.Path.Make();
    flapPath.moveTo(cx - w / 2 + 10, cy - h / 2 + 10);
    flapPath.lineTo(cx, cy + 10);
    flapPath.lineTo(cx + w / 2 - 10, cy - h / 2 + 10);

    const checkPath = Skia.Path.Make();
    if (success) {
        checkPath.moveTo(cx - 15, cy);
        checkPath.lineTo(cx - 5, cy + 12);
        checkPath.lineTo(cx + 18, cy - 10);
    } else {
        checkPath.moveTo(cx - 12, cy - 12);
        checkPath.lineTo(cx + 12, cy + 12);
        checkPath.moveTo(cx + 12, cy - 12);
        checkPath.lineTo(cx - 12, cy + 12);
    }

    return (
        <Canvas style={{ width: w, height: h }}>
            <Path path={envPath} color={COLORS.envelope} style="fill" />
            <Path path={flapPath} color={COLORS.envelopeShadow} style="stroke" strokeWidth={2} />
            <Circle cx={cx} cy={cy - 5} r={6} color={success ? COLORS.mailboxLight : COLORS.spike} style="fill" />
            <Path
                path={checkPath}
                color={success ? COLORS.mailboxLight : COLORS.spike}
                style="stroke"
                strokeWidth={3}
                strokeCap="round"
            />
        </Canvas>
    );
};

export const GameScreen: React.FC<GameScreenProps> = ({
    world,
    levelId,
    onBack,
    onNextLevel,
}) => {
    const {
        gameState,
        currentLevel,
        loadLevel,
        startSimulation,
        reset
    } = useGameStore();

    const { completeLevel } = useProgressStore();
    const { playSound } = useSoundStore();
    const haptics = useHaptics();
    const { incrementStatistic } = useAchievementStore();
    const [showResult, setShowResult] = useState<'win' | 'fail' | null>(null);

    // Load level on mount
    useEffect(() => {
        const level = getLevel(world, levelId);
        if (level) {
            loadLevel(level);
            // Increment games played statistic
            incrementStatistic('totalGamesPlayed', 1);
        }
    }, [world, levelId, loadLevel]);

    // Game loop with callbacks
    const { isWin, isFail } = useGameLoop({
        onWin: () => {
            playSound('win');
            haptics.success();
            setShowResult('win');

            // Calculate and save progress
            if (currentLevel) {
                const stars = calculateStars(currentLevel, gameState.inkUsed);
                const levelKey = getLevelKey(world, levelId);
                completeLevel(levelKey, stars, gameState.inkUsed);
                
                // Update statistics
                incrementStatistic('levelsCompleted', 1);
                incrementStatistic('totalStarsEarned', stars);
                incrementStatistic('totalInkUsed', gameState.inkUsed);
                if (stars === 3) {
                    incrementStatistic('perfectLevels', 1);
                }
            }
        },
        onFail: () => {
            playSound('fail');
            haptics.error();
            setShowResult('fail');
        },
    });

    const handleLaunch = () => {
        if (gameState.drawnSegments.length > 0) {
            playSound('launch');
            haptics.medium();
            startSimulation();
        }
    };

    const handleRetry = () => {
        playSound('buttonTap');
        setShowResult(null);
        reset();
    };

    const handleNext = () => {
        playSound('buttonTap');
        setShowResult(null);
        onNextLevel();
    };

    if (!currentLevel) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </SafeAreaView>
        );
    }

    const stars = currentLevel ? calculateStars(currentLevel, gameState.inkUsed) : 0;

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar style="light" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
                        <View style={styles.backIcon} />
                    </TouchableOpacity>
                    <View style={styles.levelInfo}>
                        <Text style={styles.levelName}>{currentLevel.name}</Text>
                        <Text style={styles.levelId}>Seviye {levelId}</Text>
                    </View>
                    <TouchableOpacity style={styles.headerBtn} onPress={handleRetry}>
                        <View style={styles.retryIcon} />
                    </TouchableOpacity>
                </View>

                {/* Ink Meter */}
                <InkMeter />

                {/* Game Canvas */}
                <View style={styles.canvasContainer}>
                    <GameCanvas />
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    {gameState.phase === 'idle' && gameState.drawnSegments.length > 0 && (
                        <TouchableOpacity style={styles.launchBtn} onPress={handleLaunch}>
                            <View style={styles.sendIcon} />
                            <Text style={styles.launchText}>GÖNDER</Text>
                        </TouchableOpacity>
                    )}

                    {gameState.phase === 'idle' && gameState.drawnSegments.length === 0 && (
                        <Text style={styles.hint}>Çizgi çizerek yol oluştur</Text>
                    )}

                    {gameState.phase === 'drawing' && (
                        <Text style={styles.hint}>Çizmeye devam et...</Text>
                    )}

                    {gameState.phase === 'simulating' && (
                        <Text style={styles.hint}>Mektup yolda...</Text>
                    )}
                </View>

                {/* Result Modal */}
                {showResult && (
                    <View style={styles.resultOverlay}>
                        <View style={styles.resultCard}>
                            <ResultEnvelope success={showResult === 'win'} />

                            {showResult === 'win' ? (
                                <>
                                    <Text style={styles.resultTitle}>Teslim Edildi</Text>
                                    <View style={styles.starsRow}>
                                        {[1, 2, 3].map((s) => (
                                            <StarIcon key={s} filled={s <= stars} />
                                        ))}
                                    </View>
                                    <Text style={styles.inkInfo}>
                                        Mürekkep: {Math.round(gameState.inkUsed)}
                                    </Text>
                                    <View style={styles.resultButtons}>
                                        <TouchableOpacity
                                            style={styles.resultBtnSecondary}
                                            onPress={handleRetry}
                                        >
                                            <Text style={styles.resultBtnSecText}>Tekrar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.resultBtnPrimary}
                                            onPress={handleNext}
                                        >
                                            <Text style={styles.resultBtnPriText}>Sonraki</Text>
                                            <View style={styles.arrowIcon} />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.resultTitle}>Kayboldu</Text>
                                    <Text style={styles.failText}>Mektup hedefe ulaşamadı</Text>
                                    <View style={styles.resultButtons}>
                                        <TouchableOpacity
                                            style={styles.resultBtnPrimary}
                                            onPress={handleRetry}
                                        >
                                            <View style={styles.retryIconLight} />
                                            <Text style={styles.resultBtnPriText}>Tekrar Dene</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity style={styles.adBtn}>
                                        <Text style={styles.adBtnText}>Devam Et (+1 Hak)</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    loadingText: {
        color: COLORS.ink,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 100,
        letterSpacing: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        width: 10,
        height: 10,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: COLORS.ink,
        transform: [{ rotate: '45deg' }, { translateX: 2 }],
    },
    retryIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.ink,
        borderTopColor: 'transparent',
    },
    levelInfo: {
        alignItems: 'center',
    },
    levelName: {
        color: COLORS.ink,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
    },
    levelId: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        letterSpacing: 2,
        marginTop: 2,
    },
    canvasContainer: {
        flex: 1,
    },
    controls: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
        minHeight: 70,
    },
    hint: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        letterSpacing: 1,
    },
    launchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.mailbox,
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 14,
        gap: 12,
    },
    sendIcon: {
        width: 0,
        height: 0,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderLeftWidth: 12,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: COLORS.ink,
    },
    launchText: {
        color: COLORS.ink,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 4,
    },
    resultOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10, 10, 20, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    resultCard: {
        backgroundColor: COLORS.backgroundLight,
        borderRadius: 24,
        paddingVertical: 32,
        paddingHorizontal: 28,
        alignItems: 'center',
        width: '100%',
        maxWidth: 320,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    resultTitle: {
        color: COLORS.ink,
        fontSize: 24,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 12,
        letterSpacing: 2,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    inkInfo: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
        marginBottom: 24,
        letterSpacing: 1,
    },
    failText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
        marginBottom: 24,
        letterSpacing: 1,
    },
    resultButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    resultBtnSecondary: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    resultBtnSecText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 1,
    },
    resultBtnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: COLORS.mailbox,
        gap: 8,
    },
    resultBtnPriText: {
        color: COLORS.ink,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 1,
    },
    arrowIcon: {
        width: 8,
        height: 8,
        borderRightWidth: 2,
        borderTopWidth: 2,
        borderColor: COLORS.ink,
        transform: [{ rotate: '45deg' }],
    },
    retryIconLight: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: COLORS.ink,
        borderTopColor: 'transparent',
    },
    adBtn: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    adBtnText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 13,
        letterSpacing: 1,
    },
});

export default GameScreen;
