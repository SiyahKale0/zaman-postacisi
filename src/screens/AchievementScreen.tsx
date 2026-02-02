import React, { useEffect } from 'react';
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
import { Canvas, Path, Circle, RoundedRect, Skia, vec } from '@shopify/react-native-skia';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    FadeIn,
    FadeInDown,
} from 'react-native-reanimated';

import { useAchievementStore, Achievement, DailyChallenge } from '../stores/achievementStore';
import { useProgressStore } from '../stores/progressStore';
import { useSoundStore } from '../stores/soundStore';
import { COLORS } from '../components/game/GameAssets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AchievementScreenProps {
    onBack: () => void;
}

// Achievement category icons
const CategoryIcon: React.FC<{ category: string; size?: number }> = ({ category, size = 40 }) => {
    const iconColor = COLORS.ink;

    switch (category) {
        case 'progress':
            // Flag icon
            const flagPath = Skia.Path.Make();
            flagPath.moveTo(12, 5);
            flagPath.lineTo(12, size - 5);
            flagPath.moveTo(12, 5);
            flagPath.lineTo(size - 5, 12);
            flagPath.lineTo(12, 20);
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={flagPath} color={iconColor} style="stroke" strokeWidth={2} />
                </Canvas>
            );

        case 'mastery':
            // Crown icon
            const crownPath = Skia.Path.Make();
            crownPath.moveTo(5, size - 10);
            crownPath.lineTo(10, 15);
            crownPath.lineTo(size / 2, 22);
            crownPath.lineTo(size - 10, 15);
            crownPath.lineTo(size - 5, size - 10);
            crownPath.close();
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={crownPath} color={COLORS.bounceSpring} style="fill" />
                </Canvas>
            );

        case 'collection':
            // Star icon
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path
                        path={(() => {
                            const p = Skia.Path.Make();
                            const cx = size / 2;
                            const cy = size / 2;
                            const r = size / 2 - 5;
                            for (let i = 0; i < 5; i++) {
                                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                                const px = cx + r * Math.cos(angle);
                                const py = cy + r * Math.sin(angle);
                                if (i === 0) p.moveTo(px, py);
                                else p.lineTo(px, py);
                            }
                            p.close();
                            return p;
                        })()}
                        color={COLORS.bounceSpring}
                        style="fill"
                    />
                </Canvas>
            );

        case 'special':
            // Diamond icon
            const diamondPath = Skia.Path.Make();
            diamondPath.moveTo(size / 2, 5);
            diamondPath.lineTo(size - 5, size / 2);
            diamondPath.lineTo(size / 2, size - 5);
            diamondPath.lineTo(5, size / 2);
            diamondPath.close();
            return (
                <Canvas style={{ width: size, height: size }}>
                    <Path path={diamondPath} color={COLORS.goal} style="fill" />
                </Canvas>
            );

        default:
            return null;
    }
};

// Achievement card component
const AchievementCard: React.FC<{
    achievement: Achievement;
    index: number;
}> = ({ achievement, index }) => {
    const progressPercent = Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
    const isComplete = achievement.unlocked;

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).springify()}
            style={[
                styles.achievementCard,
                isComplete && styles.achievementCardComplete,
            ]}
        >
            {/* Icon */}
            <View style={[
                styles.achievementIcon,
                isComplete && styles.achievementIconComplete,
            ]}>
                <CategoryIcon category={achievement.category} size={32} />
            </View>

            {/* Content */}
            <View style={styles.achievementContent}>
                <Text style={[
                    styles.achievementTitle,
                    isComplete && styles.achievementTitleComplete,
                ]}>
                    {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                    {achievement.description}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progressPercent}%` },
                                isComplete && styles.progressFillComplete,
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {achievement.progress}/{achievement.maxProgress}
                    </Text>
                </View>
            </View>

            {/* Reward */}
            <View style={styles.rewardContainer}>
                <Text style={styles.rewardAmount}>+{achievement.reward}</Text>
                <Text style={styles.rewardIcon}>💰</Text>
            </View>
        </Animated.View>
    );
};

// Daily challenge card
const DailyChallengeCard: React.FC<{ challenge: DailyChallenge }> = ({ challenge }) => {
    const progressPercent = (challenge.progress / challenge.target) * 100;
    const isComplete = challenge.completed;

    const getTimeRemaining = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}s ${minutes}d`;
    };

    return (
        <Animated.View
            entering={FadeIn.delay(100).springify()}
            style={[
                styles.dailyCard,
                isComplete && styles.dailyCardComplete,
            ]}
        >
            <View style={styles.dailyHeader}>
                <View style={styles.dailyBadge}>
                    <Text style={styles.dailyBadgeText}>🎯 Günlük Görev</Text>
                </View>
                <Text style={styles.dailyTimer}>⏰ {getTimeRemaining()}</Text>
            </View>

            <Text style={styles.dailyTitle}>{challenge.description}</Text>

            <View style={styles.dailyProgressContainer}>
                <View style={styles.dailyProgressBar}>
                    <View
                        style={[
                            styles.dailyProgressFill,
                            { width: `${progressPercent}%` },
                            isComplete && styles.dailyProgressComplete,
                        ]}
                    />
                </View>
                <Text style={styles.dailyProgressText}>
                    {challenge.progress}/{challenge.target}
                </Text>
            </View>

            <View style={styles.dailyReward}>
                <Text style={styles.dailyRewardText}>
                    Ödül: {challenge.reward} 💰
                </Text>
                {isComplete && (
                    <View style={styles.completeBadge}>
                        <Text style={styles.completeText}>✓ Tamamlandı</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

// Statistics card
const StatisticsCard: React.FC = () => {
    const { statistics } = useAchievementStore();

    const stats = [
        { label: 'Toplam Oynanan', value: statistics.totalGamesPlayed, icon: '🎮' },
        { label: 'Tamamlanan Bölüm', value: statistics.levelsCompleted, icon: '✅' },
        { label: '3 Yıldız Bölüm', value: statistics.perfectLevels, icon: '⭐' },
        { label: 'Toplam Yıldız', value: statistics.totalStarsEarned, icon: '🌟' },
        { label: 'Kullanılan Mürekkep', value: Math.floor(statistics.totalInkUsed), icon: '🖊️' },
        { label: 'Harcanan Zaman', value: `${Math.floor(statistics.totalTimeSpent / 60)}dk`, icon: '⏱️' },
    ];

    return (
        <Animated.View entering={FadeIn.delay(200)} style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 İstatistikler</Text>
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <View key={index} style={styles.statItem}>
                        <Text style={styles.statIcon}>{stat.icon}</Text>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>
        </Animated.View>
    );
};

export const AchievementScreen: React.FC<AchievementScreenProps> = ({ onBack }) => {
    const { achievements, dailyChallenge, generateDailyChallenge } = useAchievementStore();
    const { playSound } = useSoundStore();

    useEffect(() => {
        generateDailyChallenge();
    }, []);

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    // Group achievements by category
    const groupedAchievements = achievements.reduce((acc, achievement) => {
        if (!acc[achievement.category]) {
            acc[achievement.category] = [];
        }
        acc[achievement.category].push(achievement);
        return acc;
    }, {} as Record<string, Achievement[]>);

    const categoryNames: Record<string, string> = {
        progress: '🚀 İlerleme',
        mastery: '👑 Ustalık',
        collection: '⭐ Koleksiyon',
        special: '💎 Özel',
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                        playSound('buttonTap');
                        onBack();
                    }}
                >
                    <View style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.title}>Başarılar</Text>
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {unlockedCount}/{totalCount}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Daily Challenge */}
                {dailyChallenge && (
                    <View style={styles.section}>
                        <DailyChallengeCard challenge={dailyChallenge} />
                    </View>
                )}

                {/* Statistics */}
                <View style={styles.section}>
                    <StatisticsCard />
                </View>

                {/* Achievements by category */}
                {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
                    <View key={category} style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {categoryNames[category] || category}
                        </Text>
                        {categoryAchievements.map((achievement, index) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                index={index}
                            />
                        ))}
                    </View>
                ))}

                {/* Bottom padding */}
                <View style={{ height: 32 }} />
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
    },
    counterContainer: {
        backgroundColor: COLORS.ink,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
    },
    counterText: {
        color: COLORS.background,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        letterSpacing: 0.5,
    },

    // Daily Challenge styles
    dailyCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.bounceSpring,
    },
    dailyCardComplete: {
        borderColor: COLORS.goal,
        backgroundColor: 'rgba(0, 200, 100, 0.1)',
    },
    dailyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dailyBadge: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    dailyBadgeText: {
        color: COLORS.bounceSpring,
        fontSize: 12,
        fontWeight: '600',
    },
    dailyTimer: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
    },
    dailyTitle: {
        color: COLORS.ink,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    dailyProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    dailyProgressBar: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    dailyProgressFill: {
        height: '100%',
        backgroundColor: COLORS.bounceSpring,
        borderRadius: 4,
    },
    dailyProgressComplete: {
        backgroundColor: COLORS.goal,
    },
    dailyProgressText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: '500',
    },
    dailyReward: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dailyRewardText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
    },
    completeBadge: {
        backgroundColor: 'rgba(0, 255, 136, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    completeText: {
        color: COLORS.goal,
        fontSize: 12,
        fontWeight: '600',
    },

    // Statistics styles
    statsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
    },
    statsTitle: {
        color: COLORS.ink,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        width: (SCREEN_WIDTH - 40 - 32 - 24) / 3,
        alignItems: 'center',
        padding: 8,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    statValue: {
        color: COLORS.ink,
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        textAlign: 'center',
    },

    // Achievement card styles
    achievementCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        alignItems: 'center',
    },
    achievementCardComplete: {
        backgroundColor: 'rgba(0, 200, 100, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 200, 100, 0.3)',
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    achievementIconComplete: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
    },
    achievementContent: {
        flex: 1,
    },
    achievementTitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    achievementTitleComplete: {
        color: COLORS.ink,
    },
    achievementDescription: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        marginBottom: 6,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.inkLight,
        borderRadius: 2,
    },
    progressFillComplete: {
        backgroundColor: COLORS.goal,
    },
    progressText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
    },
    rewardContainer: {
        alignItems: 'center',
        marginLeft: 8,
    },
    rewardAmount: {
        color: COLORS.bounceSpring,
        fontSize: 14,
        fontWeight: '600',
    },
    rewardIcon: {
        fontSize: 12,
    },
});

export default AchievementScreen;
