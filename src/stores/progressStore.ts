import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    PlayerProgress,
    WorldType,
    LevelCompletion,
    Upgrades,
    Cosmetics,
    GAME_CONFIG
} from '../types';

interface ProgressStore extends PlayerProgress {
    // Actions
    addStamps: (amount: number) => void;
    spendStamps: (amount: number) => boolean;
    completeLevel: (levelKey: string, stars: number, inkUsed: number) => void;
    unlockWorld: (world: WorldType) => void;
    purchaseUpgrade: (upgrade: keyof Upgrades, cost: number) => boolean;
    setCosmetic: (type: keyof Cosmetics, value: string) => void;
    resetProgress: () => void;

    // Getters
    isLevelCompleted: (levelKey: string) => boolean;
    getLevelStars: (levelKey: string) => number;
    getTotalStars: () => number;
}

const initialUpgrades: Upgrades = {
    inkExtension: 0,
    cargoShell: false,
    speedAdjust: 0,
};

const initialCosmetics: Cosmetics = {
    packageSkin: 'default',
    lineEffect: 'default',
    mailboxTheme: 'default',
};

export const useProgressStore = create<ProgressStore>()(
    persist(
        (set, get) => ({
            stamps: 0,
            completedLevels: {},
            unlockedWorlds: ['stone_age'],
            upgrades: initialUpgrades,
            cosmetics: initialCosmetics,

            addStamps: (amount: number) => {
                set((state) => ({
                    stamps: state.stamps + amount,
                }));
            },

            spendStamps: (amount: number) => {
                const { stamps } = get();
                if (stamps < amount) return false;

                set({ stamps: stamps - amount });
                return true;
            },

            completeLevel: (levelKey: string, stars: number, inkUsed: number) => {
                const { completedLevels } = get();
                const existing = completedLevels[levelKey];

                // Only update if better
                const newStars = existing ? Math.max(existing.stars, stars) : stars;
                const newInk = existing ? Math.min(existing.bestInkUsed, inkUsed) : inkUsed;

                set({
                    completedLevels: {
                        ...completedLevels,
                        [levelKey]: {
                            completed: true,
                            stars: newStars,
                            bestInkUsed: newInk,
                        },
                    },
                });

                // Award stamps
                const baseStamps = GAME_CONFIG.STAMPS_PER_LEVEL;
                const starBonus = stars * GAME_CONFIG.STAMPS_PER_STAR;
                const isFirstTime = !existing?.completed;

                if (isFirstTime) {
                    get().addStamps(baseStamps + starBonus);
                } else if (stars > (existing?.stars || 0)) {
                    // Bonus for improvement
                    const bonusStars = stars - (existing?.stars || 0);
                    get().addStamps(bonusStars * GAME_CONFIG.STAMPS_PER_STAR);
                }
            },

            unlockWorld: (world: WorldType) => {
                const { unlockedWorlds } = get();
                if (unlockedWorlds.includes(world)) return;

                set({
                    unlockedWorlds: [...unlockedWorlds, world],
                });
            },

            purchaseUpgrade: (upgrade: keyof Upgrades, cost: number) => {
                const success = get().spendStamps(cost);
                if (!success) return false;

                set((state) => ({
                    upgrades: {
                        ...state.upgrades,
                        [upgrade]: typeof state.upgrades[upgrade] === 'boolean'
                            ? true
                            : (state.upgrades[upgrade] as number) + 1,
                    },
                }));

                return true;
            },

            setCosmetic: (type: keyof Cosmetics, value: string) => {
                set((state) => ({
                    cosmetics: {
                        ...state.cosmetics,
                        [type]: value,
                    },
                }));
            },

            isLevelCompleted: (levelKey: string) => {
                return get().completedLevels[levelKey]?.completed ?? false;
            },

            getLevelStars: (levelKey: string) => {
                return get().completedLevels[levelKey]?.stars ?? 0;
            },

            getTotalStars: () => {
                const { completedLevels } = get();
                return Object.values(completedLevels).reduce(
                    (total, level) => total + level.stars,
                    0
                );
            },

            resetProgress: () => {
                set({
                    stamps: 0,
                    completedLevels: {},
                    unlockedWorlds: ['stone_age'],
                    upgrades: initialUpgrades,
                    cosmetics: initialCosmetics,
                });
            },
        }),
        {
            name: 'time-postman-progress',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
