import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Achievement {
    id: string;
    name: string;
    title: string;
    description: string;
    icon: string;
    category: 'progress' | 'mastery' | 'collection' | 'special';
    requirement: number;
    reward: number;
    progress: number;
    maxProgress: number;
    unlocked: boolean;
    unlockedAt?: number;
}

export interface DailyChallenge {
    id: string;
    date: string;
    type: 'complete_levels' | 'collect_stars' | 'use_ink_under' | 'no_fail';
    description: string;
    target: number;
    progress: number;
    reward: number;
    completed: boolean;
    claimed: boolean;
}

export interface Statistics {
    totalGamesPlayed: number;
    levelsCompleted: number;
    perfectLevels: number;
    totalStarsEarned: number;
    totalInkUsed: number;
    totalTimeSpent: number;
    consecutiveDays: number;
    lastPlayDate: string;
    totalBounces: number;
    totalTeleports: number;
    worldsUnlocked: number;
}

export interface AchievementState {
    achievements: Achievement[];
    dailyChallenge: DailyChallenge | null;
    statistics: Statistics;
    lastChallengeDate: string;

    // Actions
    initAchievements: () => void;
    updateAchievementProgress: (achievementId: string, progress: number) => void;
    incrementStatistic: (stat: keyof Statistics, amount: number) => void;
    generateDailyChallenge: () => void;
    updateChallengeProgress: (amount: number) => void;
    claimChallengeReward: () => number;
    resetAchievements: () => void;
    
    // Getters
    getUnlockedCount: () => number;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
    // Progress achievements
    { id: 'first_delivery', name: 'İlk Teslimat', title: 'İlk Teslimat', description: 'İlk seviyeyi tamamla', icon: '📮', category: 'progress', requirement: 1, maxProgress: 1, reward: 10 },
    { id: 'novice_postman', name: 'Çırak Postacı', title: 'Çırak Postacı', description: '10 seviye tamamla', icon: '📫', category: 'progress', requirement: 10, maxProgress: 10, reward: 25 },
    { id: 'skilled_postman', name: 'Kalfa Postacı', title: 'Kalfa Postacı', description: '25 seviye tamamla', icon: '📬', category: 'progress', requirement: 25, maxProgress: 25, reward: 50 },
    { id: 'master_postman', name: 'Usta Postacı', title: 'Usta Postacı', description: '50 seviye tamamla', icon: '📭', category: 'progress', requirement: 50, maxProgress: 50, reward: 100 },

    // Mastery achievements
    { id: 'star_collector', name: 'Yıldız Avcısı', title: 'Yıldız Avcısı', description: '50 yıldız topla', icon: '⭐', category: 'mastery', requirement: 50, maxProgress: 50, reward: 30 },
    { id: 'star_master', name: 'Yıldız Ustası', title: 'Yıldız Ustası', description: '150 yıldız topla', icon: '🌟', category: 'mastery', requirement: 150, maxProgress: 150, reward: 75 },
    { id: 'perfectionist', name: 'Mükemmeliyetçi', title: 'Mükemmeliyetçi', description: '10 seviyede 3 yıldız al', icon: '💯', category: 'mastery', requirement: 10, maxProgress: 10, reward: 50 },
    { id: 'ink_saver', name: 'Mürekkep Cimrisi', title: 'Mürekkep Cimrisi', description: 'Toplam 5000 mürekkep tasarruf et', icon: '🖋️', category: 'mastery', requirement: 5000, maxProgress: 5000, reward: 40 },

    // Collection achievements
    { id: 'stamp_hoarder', name: 'Pul Koleksiyoncusu', title: 'Pul Koleksiyoncusu', description: '500 pul biriktir', icon: '💰', category: 'collection', requirement: 500, maxProgress: 500, reward: 50 },
    { id: 'time_explorer', name: 'Zaman Kaşifi', title: 'Zaman Kaşifi', description: '3 dünyayı aç', icon: '🌍', category: 'collection', requirement: 3, maxProgress: 3, reward: 75 },
    { id: 'dimension_master', name: 'Boyut Ustası', title: 'Boyut Ustası', description: 'Tüm dünyaları aç', icon: '🌌', category: 'collection', requirement: 5, maxProgress: 5, reward: 200 },
    { id: 'game_veteran', name: 'Oyun Gazisi', title: 'Oyun Gazisi', description: '100 oyun oyna', icon: '🎮', category: 'collection', requirement: 100, maxProgress: 100, reward: 60 },

    // Special achievements
    { id: 'bouncy_journey', name: 'Zıplama Yolculuğu', title: 'Zıplama Yolculuğu', description: '100 kez zıpla', icon: '🦘', category: 'special', requirement: 100, maxProgress: 100, reward: 25 },
    { id: 'teleport_master', name: 'Portal Ustası', title: 'Portal Ustası', description: '50 kez ışınlan', icon: '🌀', category: 'special', requirement: 50, maxProgress: 50, reward: 25 },
    { id: 'dedicated_player', name: 'Sadık Oyuncu', title: 'Sadık Oyuncu', description: '7 gün üst üste oyna', icon: '📅', category: 'special', requirement: 7, maxProgress: 7, reward: 100 },
    { id: 'speed_demon', name: 'Hız Şeytanı', title: 'Hız Şeytanı', description: 'Çok az mürekkep kullan', icon: '⚡', category: 'special', requirement: 50, maxProgress: 50, reward: 50 },
];

const DAILY_CHALLENGE_TYPES: Array<{
    type: DailyChallenge['type'];
    targets: number[];
    rewards: number[];
    descriptions: string[];
}> = [
    {
        type: 'complete_levels',
        targets: [3, 5, 7],
        rewards: [15, 25, 40],
        descriptions: ['3 seviye tamamla', '5 seviye tamamla', '7 seviye tamamla'],
    },
    {
        type: 'collect_stars',
        targets: [5, 10, 15],
        rewards: [20, 35, 50],
        descriptions: ['5 yıldız topla', '10 yıldız topla', '15 yıldız topla'],
    },
    {
        type: 'use_ink_under',
        targets: [150, 120, 100],
        rewards: [25, 40, 60],
        descriptions: ['150\'den az mürekkep kullan', '120\'den az mürekkep kullan', '100\'den az mürekkep kullan'],
    },
    {
        type: 'no_fail',
        targets: [3, 5, 7],
        rewards: [30, 50, 75],
        descriptions: ['3 seviyeyi başarısız olmadan bitir', '5 seviyeyi başarısız olmadan bitir', '7 seviyeyi başarısız olmadan bitir'],
    },
];

const initialStatistics: Statistics = {
    totalGamesPlayed: 0,
    levelsCompleted: 0,
    perfectLevels: 0,
    totalStarsEarned: 0,
    totalInkUsed: 0,
    totalTimeSpent: 0,
    consecutiveDays: 0,
    lastPlayDate: '',
    totalBounces: 0,
    totalTeleports: 0,
    worldsUnlocked: 1,
};

const createInitialAchievements = (): Achievement[] => {
    return ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        progress: 0,
        unlocked: false,
    }));
};

export const useAchievementStore = create<AchievementState>()(
    persist(
        (set, get) => ({
            achievements: createInitialAchievements(),
            dailyChallenge: null,
            statistics: initialStatistics,
            lastChallengeDate: '',

            initAchievements: () => {
                const { achievements } = get();
                if (achievements.length === 0) {
                    set({ achievements: createInitialAchievements() });
                }
            },

            updateAchievementProgress: (achievementId, progress) => {
                set((state) => ({
                    achievements: state.achievements.map(a => {
                        if (a.id === achievementId) {
                            const newProgress = Math.min(progress, a.maxProgress);
                            const unlocked = newProgress >= a.requirement;
                            return {
                                ...a,
                                progress: newProgress,
                                unlocked,
                                unlockedAt: unlocked && !a.unlocked ? Date.now() : a.unlockedAt,
                            };
                        }
                        return a;
                    }),
                }));
            },

            incrementStatistic: (stat, amount) => {
                set((state) => {
                    const newStats = {
                        ...state.statistics,
                        [stat]: (state.statistics[stat] as number) + amount,
                    };
                    
                    // Check for consecutive days
                    const today = new Date().toISOString().split('T')[0];
                    if (state.statistics.lastPlayDate !== today) {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];

                        if (state.statistics.lastPlayDate === yesterdayStr) {
                            newStats.consecutiveDays = state.statistics.consecutiveDays + 1;
                        } else {
                            newStats.consecutiveDays = 1;
                        }
                        newStats.lastPlayDate = today;
                    }
                    
                    return { statistics: newStats };
                });
                
                // Update achievement progress based on stat
                const { statistics, updateAchievementProgress } = get();
                const statValue = statistics[stat] as number;
                
                // Map stats to achievements
                const statAchievementMap: Record<string, string[]> = {
                    levelsCompleted: ['first_delivery', 'novice_postman', 'skilled_postman', 'master_postman'],
                    totalStarsEarned: ['star_collector', 'star_master'],
                    perfectLevels: ['perfectionist'],
                    totalGamesPlayed: ['game_veteran'],
                    worldsUnlocked: ['time_explorer', 'dimension_master'],
                    totalBounces: ['bouncy_journey'],
                    totalTeleports: ['teleport_master'],
                    consecutiveDays: ['dedicated_player'],
                };
                
                const achievementIds = statAchievementMap[stat] || [];
                achievementIds.forEach(id => {
                    updateAchievementProgress(id, statValue + amount);
                });
            },

            generateDailyChallenge: () => {
                const today = new Date().toISOString().split('T')[0];
                const { lastChallengeDate } = get();

                if (lastChallengeDate === today) return;

                const typeIndex = Math.floor(Math.random() * DAILY_CHALLENGE_TYPES.length);
                const difficultyIndex = Math.floor(Math.random() * 3);
                const challengeType = DAILY_CHALLENGE_TYPES[typeIndex];

                const challenge: DailyChallenge = {
                    id: `${today}_${challengeType.type}`,
                    date: today,
                    type: challengeType.type,
                    description: challengeType.descriptions[difficultyIndex],
                    target: challengeType.targets[difficultyIndex],
                    progress: 0,
                    reward: challengeType.rewards[difficultyIndex],
                    completed: false,
                    claimed: false,
                };

                set({
                    dailyChallenge: challenge,
                    lastChallengeDate: today,
                });
            },

            updateChallengeProgress: (amount) => {
                const { dailyChallenge } = get();
                if (!dailyChallenge || dailyChallenge.completed) return;

                const newProgress = dailyChallenge.progress + amount;
                const completed = newProgress >= dailyChallenge.target;

                set({
                    dailyChallenge: {
                        ...dailyChallenge,
                        progress: Math.min(newProgress, dailyChallenge.target),
                        completed,
                    },
                });
            },

            claimChallengeReward: () => {
                const { dailyChallenge } = get();
                if (!dailyChallenge || !dailyChallenge.completed || dailyChallenge.claimed) return 0;

                set({
                    dailyChallenge: {
                        ...dailyChallenge,
                        claimed: true,
                    },
                });

                return dailyChallenge.reward;
            },

            resetAchievements: () => {
                set({
                    achievements: createInitialAchievements(),
                    dailyChallenge: null,
                    statistics: initialStatistics,
                    lastChallengeDate: '',
                });
            },

            getUnlockedCount: () => get().achievements.filter(a => a.unlocked).length,
        }),
        {
            name: 'time-postman-achievements',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
