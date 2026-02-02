import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Canvas, Path, Circle, Skia, LinearGradient, vec } from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { useProgressStore } from '../stores/progressStore';
import { getLevelsByWorld, worldMeta } from '../utils/levelLoader';
import { WorldType } from '../types';
import { COLORS } from '../components/game/GameAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WorldSelectScreenProps {
    onBack: () => void;
    onSelectWorld: (world: WorldType) => void;
}

const WORLDS: WorldType[] = ['stone_age', 'medieval', 'ottoman_steam', 'neon_cyber', 'mars'];

const WORLD_COLORS: Record<WorldType, { primary: string; secondary: string; accent: string }> = {
    stone_age: {
        primary: '#8B4513',
        secondary: '#A0522D',
        accent: '#D2691E',
    },
    medieval: {
        primary: '#4A4A4A',
        secondary: '#696969',
        accent: '#B8860B',
    },
    ottoman_steam: {
        primary: '#B87333',
        secondary: '#CD853F',
        accent: '#DAA520',
    },
    neon_cyber: {
        primary: '#9400D3',
        secondary: '#00CED1',
        accent: '#FF1493',
    },
    mars: {
        primary: '#FF4500',
        secondary: '#CD5C5C',
        accent: '#FFD700',
    },
};

const WORLD_REQUIREMENTS: Record<WorldType, { stars: number; world?: WorldType }> = {
    stone_age: { stars: 0 },
    medieval: { stars: 15, world: 'stone_age' },
    ottoman_steam: { stars: 40, world: 'medieval' },
    neon_cyber: { stars: 70, world: 'ottoman_steam' },
    mars: { stars: 100, world: 'neon_cyber' },
};

// World card component
const WorldCard: React.FC<{
    world: WorldType;
    isUnlocked: boolean;
    isCompleted: boolean;
    starsCollected: number;
    totalStars: number;
    onPress: () => void;
}> = ({ world, isUnlocked, isCompleted, starsCollected, totalStars, onPress }) => {
    const meta = worldMeta[world];
    const colors = WORLD_COLORS[world];
    const requirement = WORLD_REQUIREMENTS[world];

    const cardWidth = SCREEN_WIDTH - 48;
    const cardHeight = 140;

    // Create world icon
    const renderWorldIcon = () => {
        const size = 60;

        switch (world) {
            case 'stone_age':
                // Mountain/rock shape
                const rockPath = Skia.Path.Make();
                rockPath.moveTo(size / 2, 8);
                rockPath.lineTo(size - 8, size - 8);
                rockPath.lineTo(8, size - 8);
                rockPath.close();
                return (
                    <Canvas style={{ width: size, height: size }}>
                        <Path path={rockPath} color={colors.secondary} style="fill" />
                        <Path path={rockPath} color={colors.accent} style="stroke" strokeWidth={2} />
                    </Canvas>
                );

            case 'medieval':
                // Castle shape
                const castlePath = Skia.Path.Make();
                castlePath.addRect({ x: 15, y: 25, width: 30, height: 30 });
                castlePath.addRect({ x: 10, y: 15, width: 10, height: 15 });
                castlePath.addRect({ x: 25, y: 10, width: 10, height: 20 });
                castlePath.addRect({ x: 40, y: 15, width: 10, height: 15 });
                return (
                    <Canvas style={{ width: size, height: size }}>
                        <Path path={castlePath} color={colors.secondary} style="fill" />
                        <Path path={castlePath} color={colors.accent} style="stroke" strokeWidth={1.5} />
                    </Canvas>
                );

            case 'ottoman_steam':
                // Gear shape
                return (
                    <Canvas style={{ width: size, height: size }}>
                        <Circle cx={size / 2} cy={size / 2} r={22} color={colors.secondary} style="fill" />
                        <Circle cx={size / 2} cy={size / 2} r={22} color={colors.accent} style="stroke" strokeWidth={3} />
                        <Circle cx={size / 2} cy={size / 2} r={10} color={COLORS.background} style="fill" />
                        <Circle cx={size / 2} cy={size / 2} r={5} color={colors.accent} style="fill" />
                    </Canvas>
                );

            case 'neon_cyber':
                // Circuit shape
                const circuitPath = Skia.Path.Make();
                circuitPath.moveTo(10, size / 2);
                circuitPath.lineTo(size - 10, size / 2);
                circuitPath.moveTo(size / 2, 10);
                circuitPath.lineTo(size / 2, size - 10);
                circuitPath.moveTo(15, 15);
                circuitPath.lineTo(size - 15, size - 15);
                circuitPath.moveTo(size - 15, 15);
                circuitPath.lineTo(15, size - 15);
                return (
                    <Canvas style={{ width: size, height: size }}>
                        <Circle cx={size / 2} cy={size / 2} r={24} color="rgba(0, 255, 255, 0.2)" style="fill" />
                        <Path path={circuitPath} color={colors.secondary} style="stroke" strokeWidth={2} />
                        <Circle cx={size / 2} cy={size / 2} r={8} color={colors.accent} style="fill" />
                    </Canvas>
                );

            case 'mars':
                // Planet shape
                return (
                    <Canvas style={{ width: size, height: size }}>
                        <Circle cx={size / 2} cy={size / 2} r={24} color={colors.primary} style="fill" />
                        <Circle cx={size / 2 - 8} cy={size / 2 - 8} r={6} color={colors.secondary} style="fill" />
                        <Circle cx={size / 2 + 10} cy={size / 2 + 5} r={4} color={colors.secondary} style="fill" />
                        <Circle cx={size / 2} cy={size / 2} r={24} color={colors.accent} style="stroke" strokeWidth={2} />
                    </Canvas>
                );
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.worldCard,
                !isUnlocked && styles.worldCardLocked,
            ]}
            onPress={onPress}
            disabled={!isUnlocked}
            activeOpacity={0.8}
        >
            {/* Background gradient effect */}
            <View style={[styles.cardGradient, { backgroundColor: isUnlocked ? colors.primary : '#333' }]}>
                <View style={[styles.cardGradientOverlay, { opacity: isUnlocked ? 0.3 : 0.5 }]} />
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    {isUnlocked ? renderWorldIcon() : (
                        <View style={styles.lockIcon}>
                            <Text style={styles.lockEmoji}>🔒</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.cardInfo}>
                    <Text style={[styles.worldName, !isUnlocked && styles.textLocked]}>
                        {meta.name}
                    </Text>

                    {isUnlocked ? (
                        <>
                            <View style={styles.progressRow}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${(starsCollected / totalStars) * 100}%`,
                                                backgroundColor: colors.accent,
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    ⭐ {starsCollected}/{totalStars}
                                </Text>
                            </View>
                            {isCompleted && (
                                <View style={styles.completedBadge}>
                                    <Text style={styles.completedText}>✓ Tamamlandı</Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <Text style={styles.requirementText}>
                            🔓 {requirement.stars} yıldız gerekli
                        </Text>
                    )}
                </View>

                {/* Arrow */}
                {isUnlocked && (
                    <View style={styles.arrowContainer}>
                        <Text style={styles.arrow}>›</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export const WorldSelectScreen: React.FC<WorldSelectScreenProps> = ({
    onBack,
    onSelectWorld,
}) => {
    const { getTotalStars, completedLevels, unlockedWorlds } = useProgressStore();
    const totalStars = getTotalStars();

    const getWorldProgress = (world: WorldType) => {
        const levels = getLevelsByWorld(world);
        let starsCollected = 0;

        levels.forEach(level => {
            const key = `${world}_${level.id}`;
            starsCollected += completedLevels[key]?.stars || 0;
        });

        return {
            starsCollected,
            totalStars: levels.length * 3,
            isCompleted: starsCollected >= levels.length * 3,
        };
    };

    const isWorldUnlocked = (world: WorldType) => {
        const requirement = WORLD_REQUIREMENTS[world];
        return totalStars >= requirement.stars || unlockedWorlds.includes(world);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <View style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>Zaman Şubeleri</Text>
                <View style={styles.starsContainer}>
                    <Text style={styles.starsText}>⭐ {totalStars}</Text>
                </View>
            </View>

            {/* World List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {WORLDS.map((world, index) => {
                    const progress = getWorldProgress(world);
                    const isUnlocked = isWorldUnlocked(world);

                    return (
                        <Animated.View
                            key={world}
                            style={{ marginBottom: 16 }}
                        >
                            <WorldCard
                                world={world}
                                isUnlocked={isUnlocked}
                                isCompleted={progress.isCompleted}
                                starsCollected={progress.starsCollected}
                                totalStars={progress.totalStars}
                                onPress={() => onSelectWorld(world)}
                            />
                        </Animated.View>
                    );
                })}

                {/* Footer info */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Yıldız toplayarak yeni dünyaların kilidini aç
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    title: {
        color: COLORS.ink,
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 1,
    },
    starsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
    },
    starsText: {
        color: COLORS.bounceSpring,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 32,
    },
    worldCard: {
        borderRadius: 20,
        overflow: 'hidden',
        height: 140,
    },
    worldCardLocked: {
        opacity: 0.7,
    },
    cardGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    cardGradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    iconContainer: {
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    lockIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockEmoji: {
        fontSize: 28,
    },
    cardInfo: {
        flex: 1,
    },
    worldName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    textLocked: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        fontWeight: '500',
    },
    completedBadge: {
        marginTop: 8,
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    completedText: {
        color: '#00ff88',
        fontSize: 11,
        fontWeight: '600',
    },
    requirementText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
    },
    arrowContainer: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrow: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 28,
        fontWeight: '300',
    },
    footer: {
        marginTop: 16,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 12,
        letterSpacing: 0.5,
    },
});

export default WorldSelectScreen;
