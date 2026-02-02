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
import { Canvas, Path, Circle, Skia } from '@shopify/react-native-skia';

import { useProgressStore } from '../stores/progressStore';
import { getLevelsByWorld, worldMeta, getLevelKey } from '../utils/levelLoader';
import { WorldType } from '../types';
import { COLORS } from '../components/game/GameAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LEVEL_BUTTON_SIZE = (SCREEN_WIDTH - 80) / 5;

interface LevelSelectScreenProps {
    world: WorldType;
    onBack: () => void;
    onSelectLevel: (levelId: number) => void;
}

// Mini star for level cards
const MiniStar: React.FC<{ filled: boolean }> = ({ filled }) => {
    const size = 10;
    const starPath = Skia.Path.Make();
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 1;
    const innerR = outerR * 0.4;

    for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * Math.PI / 180;
        const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;

        const ox = cx + Math.cos(outerAngle) * outerR;
        const oy = cy + Math.sin(outerAngle) * outerR;
        const ix = cx + Math.cos(innerAngle) * innerR;
        const iy = cy + Math.sin(innerAngle) * innerR;

        if (i === 0) starPath.moveTo(ox, oy);
        else starPath.lineTo(ox, oy);
        starPath.lineTo(ix, iy);
    }
    starPath.close();

    return (
        <Canvas style={{ width: size, height: size }}>
            <Path
                path={starPath}
                color={filled ? COLORS.bounceSpring : 'rgba(255, 255, 255, 0.2)'}
                style="fill"
            />
        </Canvas>
    );
};

// World era icons (minimal geometric shapes)
const getWorldIcon = (world: WorldType): React.ReactElement => {
    const size = 32;

    const iconPaths: Record<WorldType, () => React.ReactElement> = {
        'stone_age': () => {
            // Simple rock/mountain shape
            const path = Skia.Path.Make();
            path.moveTo(size / 2, 4);
            path.lineTo(size - 4, size - 4);
            path.lineTo(4, size - 4);
            path.close();
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={path} color="#8b7355" style="fill" />
                </Canvas>
            );
        },
        'medieval': () => {
            // Castle tower shape
            const path = Skia.Path.Make();
            path.addRect({ x: 8, y: 12, width: 16, height: 16 });
            path.addRect({ x: 6, y: 6, width: 4, height: 8 });
            path.addRect({ x: 14, y: 6, width: 4, height: 8 });
            path.addRect({ x: 22, y: 6, width: 4, height: 8 });
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={path} color="#7a6a5a" style="fill" />
                </Canvas>
            );
        },
        'ottoman_steam': () => {
            // Gear/cog shape
            const path = Skia.Path.Make();
            path.addCircle(size / 2, size / 2, 10);
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={path} color="#b87333" style="fill" />
                    <Circle cx={size / 2} cy={size / 2} r={5} color={COLORS.background} style="fill" />
                </Canvas>
            );
        },
        'neon_cyber': () => {
            // Circuit/grid shape
            const path = Skia.Path.Make();
            path.moveTo(4, size / 2);
            path.lineTo(size - 4, size / 2);
            path.moveTo(size / 2, 4);
            path.lineTo(size / 2, size - 4);
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={path} color="#00ffaa" style="stroke" strokeWidth={2} />
                    <Circle cx={size / 2} cy={size / 2} r={4} color="#00ffaa" style="fill" />
                </Canvas>
            );
        },
        'mars': () => {
            // Planet shape
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Circle cx={size / 2} cy={size / 2} r={12} color="#c1440e" style="fill" />
                    <Circle cx={size / 2 - 4} cy={size / 2 - 4} r={3} color="#a33c0c" style="fill" />
                </Canvas>
            );
        },
    };

    return iconPaths[world]();
};

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
    world,
    onBack,
    onSelectLevel,
}) => {
    const { isLevelCompleted, getLevelStars } = useProgressStore();
    const levels = getLevelsByWorld(world);
    const meta = worldMeta[world];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <View style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    {getWorldIcon(world)}
                    <Text style={styles.worldName}>{meta.name}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {/* Level Grid */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.gridContainer}
            >
                {levels.map((level) => {
                    const levelKey = getLevelKey(world, level.id);
                    const completed = isLevelCompleted(levelKey);
                    const stars = getLevelStars(levelKey);
                    const isLocked = level.id > 1 && !isLevelCompleted(getLevelKey(world, level.id - 1));

                    return (
                        <TouchableOpacity
                            key={level.id}
                            style={[
                                styles.levelButton,
                                completed && styles.levelCompleted,
                                isLocked && styles.levelLocked,
                            ]}
                            onPress={() => !isLocked && onSelectLevel(level.id)}
                            disabled={isLocked}
                        >
                            {isLocked ? (
                                <View style={styles.lockIcon} />
                            ) : (
                                <>
                                    <Text style={[
                                        styles.levelNumber,
                                        completed && styles.levelNumberCompleted
                                    ]}>
                                        {level.id}
                                    </Text>
                                    {completed && (
                                        <View style={styles.starsContainer}>
                                            {[1, 2, 3].map((s) => (
                                                <MiniStar key={s} filled={s <= stars} />
                                            ))}
                                        </View>
                                    )}
                                </>
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Coming soon placeholder */}
                {levels.length < 10 && (
                    <View style={styles.comingSoon}>
                        <View style={styles.comingSoonLine} />
                        <Text style={styles.comingSoonText}>Daha fazla seviye yakında</Text>
                    </View>
                )}
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
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backBtn: {
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    worldName: {
        color: COLORS.ink,
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 2,
    },
    scrollView: {
        flex: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
        gap: 12,
        justifyContent: 'center',
    },
    levelButton: {
        width: LEVEL_BUTTON_SIZE,
        height: LEVEL_BUTTON_SIZE,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    levelCompleted: {
        backgroundColor: 'rgba(45, 90, 39, 0.2)',
        borderColor: COLORS.mailbox,
    },
    levelLocked: {
        opacity: 0.4,
    },
    levelNumber: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 1,
    },
    levelNumberCompleted: {
        color: COLORS.ink,
    },
    lockIcon: {
        width: 12,
        height: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 6,
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
    },
    starsContainer: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 1,
    },
    comingSoon: {
        width: '100%',
        paddingVertical: 32,
        alignItems: 'center',
    },
    comingSoonLine: {
        width: 40,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 12,
    },
    comingSoonText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 13,
        letterSpacing: 2,
    },
});

export default LevelSelectScreen;
