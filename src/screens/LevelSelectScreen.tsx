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

import { Button } from '../components/ui/Button';
import { useProgressStore } from '../stores/progressStore';
import { getLevelsByWorld, worldMeta, getLevelKey } from '../utils/levelLoader';
import { WorldType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LEVEL_BUTTON_SIZE = (SCREEN_WIDTH - 80) / 5;

interface LevelSelectScreenProps {
    world: WorldType;
    onBack: () => void;
    onSelectLevel: (levelId: number) => void;
}

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
                <Button
                    title="←"
                    onPress={onBack}
                    variant="secondary"
                    size="small"
                />
                <View style={styles.titleContainer}>
                    <Text style={styles.worldIcon}>{meta.icon}</Text>
                    <Text style={styles.worldName}>{meta.name}</Text>
                </View>
                <View style={{ width: 40 }} />
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
                                <Text style={styles.lockIcon}>🔒</Text>
                            ) : (
                                <>
                                    <Text style={styles.levelNumber}>{level.id}</Text>
                                    {completed && (
                                        <View style={styles.starsContainer}>
                                            {[1, 2, 3].map((s) => (
                                                <Text key={s} style={styles.starSmall}>
                                                    {s <= stars ? '⭐' : '☆'}
                                                </Text>
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
                        <Text style={styles.comingSoonText}>Daha fazla level yakında! 🚧</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f1a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    worldIcon: {
        fontSize: 28,
    },
    worldName: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    levelCompleted: {
        backgroundColor: 'rgba(34, 204, 85, 0.2)',
        borderColor: '#22cc55',
    },
    levelLocked: {
        opacity: 0.5,
    },
    levelNumber: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    lockIcon: {
        fontSize: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    starSmall: {
        fontSize: 10,
    },
    comingSoon: {
        width: '100%',
        paddingVertical: 32,
        alignItems: 'center',
    },
    comingSoonText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
    },
});

export default LevelSelectScreen;
