import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import { GameCanvas } from '../components/game/GameCanvas';
import { InkMeter } from '../components/ui/InkMeter';
import { Button } from '../components/ui/Button';
import { useGameStore } from '../stores/gameStore';
import { useProgressStore } from '../stores/progressStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { getLevel, calculateStars, getLevelKey } from '../utils/levelLoader';
import { WorldType, Level } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GameScreenProps {
    world: WorldType;
    levelId: number;
    onBack: () => void;
    onNextLevel: () => void;
}

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
    const [showResult, setShowResult] = useState<'win' | 'fail' | null>(null);

    // Load level on mount
    useEffect(() => {
        const level = getLevel(world, levelId);
        if (level) {
            loadLevel(level);
        }
    }, [world, levelId, loadLevel]);

    // Game loop with callbacks
    const { isWin, isFail } = useGameLoop({
        onWin: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowResult('win');

            // Calculate and save progress
            if (currentLevel) {
                const stars = calculateStars(currentLevel, gameState.inkUsed);
                const levelKey = getLevelKey(world, levelId);
                completeLevel(levelKey, stars, gameState.inkUsed);
            }
        },
        onFail: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setShowResult('fail');
        },
    });

    const handleLaunch = () => {
        if (gameState.drawnSegments.length > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            startSimulation();
        }
    };

    const handleRetry = () => {
        setShowResult(null);
        reset();
    };

    const handleNext = () => {
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
                    <Button
                        title="←"
                        onPress={onBack}
                        variant="secondary"
                        size="small"
                    />
                    <View style={styles.levelInfo}>
                        <Text style={styles.levelName}>{currentLevel.name}</Text>
                        <Text style={styles.levelId}>Level {levelId}</Text>
                    </View>
                    <Button
                        title="↻"
                        onPress={handleRetry}
                        variant="secondary"
                        size="small"
                    />
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
                        <Button
                            title="🚀 Gönder!"
                            onPress={handleLaunch}
                            variant="success"
                            size="large"
                        />
                    )}

                    {gameState.phase === 'idle' && gameState.drawnSegments.length === 0 && (
                        <Text style={styles.hint}>👆 Parmağınla çizgi çiz</Text>
                    )}

                    {gameState.phase === 'drawing' && (
                        <Text style={styles.hint}>✏️ Çizmeye devam et...</Text>
                    )}

                    {gameState.phase === 'simulating' && (
                        <Text style={styles.hint}>📦 Paket yolda...</Text>
                    )}
                </View>

                {/* Result Modal */}
                {showResult && (
                    <View style={styles.resultOverlay}>
                        <View style={styles.resultCard}>
                            {showResult === 'win' ? (
                                <>
                                    <Text style={styles.resultEmoji}>🎉</Text>
                                    <Text style={styles.resultTitle}>Teslim Edildi!</Text>
                                    <View style={styles.starsRow}>
                                        {[1, 2, 3].map((s) => (
                                            <Text key={s} style={styles.star}>
                                                {s <= stars ? '⭐' : '☆'}
                                            </Text>
                                        ))}
                                    </View>
                                    <Text style={styles.inkInfo}>
                                        Mürekkep: {Math.round(gameState.inkUsed)} kullanıldı
                                    </Text>
                                    <View style={styles.resultButtons}>
                                        <Button
                                            title="Tekrar"
                                            onPress={handleRetry}
                                            variant="secondary"
                                        />
                                        <Button
                                            title="Sonraki →"
                                            onPress={handleNext}
                                            variant="success"
                                        />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.resultEmoji}>💥</Text>
                                    <Text style={styles.resultTitle}>Kayboldu!</Text>
                                    <Text style={styles.failText}>Paket hedefe ulaşamadı</Text>
                                    <View style={styles.resultButtons}>
                                        <Button
                                            title="↻ Tekrar Dene"
                                            onPress={handleRetry}
                                            variant="primary"
                                            size="large"
                                        />
                                    </View>
                                    <Button
                                        title="📺 Devam Et (+1 Hak)"
                                        onPress={() => {
                                            // TODO: Show rewarded ad
                                            handleRetry();
                                        }}
                                        variant="secondary"
                                        size="medium"
                                        style={{ marginTop: 12 }}
                                    />
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
        backgroundColor: '#0f0f1a',
    },
    safeArea: {
        flex: 1,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    levelInfo: {
        alignItems: 'center',
    },
    levelName: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    levelId: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
    },
    canvasContainer: {
        flex: 1,
    },
    controls: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    hint: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
    },
    resultOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    resultCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
    },
    resultEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    resultTitle: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    star: {
        fontSize: 36,
    },
    inkInfo: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginBottom: 24,
    },
    failText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        marginBottom: 24,
    },
    resultButtons: {
        flexDirection: 'row',
        gap: 12,
    },
});

export default GameScreen;
