import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

interface SoundState {
    // Settings
    soundEnabled: boolean;
    musicEnabled: boolean;
    hapticsEnabled: boolean;
    soundVolume: number;
    musicVolume: number;

    // Sound objects
    backgroundMusic: Audio.Sound | null;
    currentTrack: string | null;
    isPlaying: boolean;

    // Actions
    setSoundEnabled: (enabled: boolean) => void;
    setMusicEnabled: (enabled: boolean) => void;
    setHapticsEnabled: (enabled: boolean) => void;
    setSoundVolume: (volume: number) => void;
    setMusicVolume: (volume: number) => void;

    // Sound playback
    playSound: (soundName: SoundName) => Promise<void>;
    playBackgroundMusic: (track: MusicTrack) => Promise<void>;
    stopBackgroundMusic: () => Promise<void>;
    pauseBackgroundMusic: () => Promise<void>;
    resumeBackgroundMusic: () => Promise<void>;

    // Cleanup
    cleanup: () => Promise<void>;
}

export type SoundName =
    | 'button_click'
    | 'buttonTap'  // alias for button_click
    | 'draw_start'
    | 'draw_end'
    | 'launch'
    | 'bounce'
    | 'stone_hit'
    | 'spike_hit'
    | 'teleport'
    | 'win'
    | 'fail'
    | 'star_collect'
    | 'stamp_collect'
    | 'upgrade_purchase'
    | 'level_unlock'
    | 'world_unlock';

export type MusicTrack =
    | 'menu'
    | 'stone_age'
    | 'medieval'
    | 'ottoman_steam'
    | 'neon_cyber'
    | 'mars';

// Free sound effect URLs from Pixabay (royalty-free)
const SOUND_URLS: Record<SoundName, string> = {
    button_click: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3',
    buttonTap: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3',
    draw_start: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7f8a7c5bf6.mp3',
    draw_end: 'https://cdn.pixabay.com/audio/2021/08/04/audio_c507a72e0c.mp3',
    launch: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749bf54.mp3',
    bounce: 'https://cdn.pixabay.com/audio/2022/03/10/audio_370955fc2e.mp3',
    stone_hit: 'https://cdn.pixabay.com/audio/2022/03/24/audio_9a179db6ca.mp3',
    spike_hit: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
    teleport: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8e81ac6ae5.mp3',
    win: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3',
    fail: 'https://cdn.pixabay.com/audio/2022/03/15/audio_fc81b5a7b3.mp3',
    star_collect: 'https://cdn.pixabay.com/audio/2022/03/24/audio_805cb26daa.mp3',
    stamp_collect: 'https://cdn.pixabay.com/audio/2022/01/18/audio_8db1f1b5a5.mp3',
    upgrade_purchase: 'https://cdn.pixabay.com/audio/2022/03/15/audio_0f1b2cf8d8.mp3',
    level_unlock: 'https://cdn.pixabay.com/audio/2022/03/15/audio_f4c739e577.mp3',
    world_unlock: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3',
};

// Background music URLs (royalty-free loopable tracks from Pixabay)
const MUSIC_URLS: Record<MusicTrack, string> = {
    menu: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    stone_age: 'https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3',
    medieval: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3',
    ottoman_steam: 'https://cdn.pixabay.com/audio/2024/11/10/audio_03cd79ec2b.mp3',
    neon_cyber: 'https://cdn.pixabay.com/audio/2022/05/16/audio_3ade419463.mp3',
    mars: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
};

// Sound cache for quick playback
const soundCache: Map<string, Audio.Sound> = new Map();

// Initialize audio
let isAudioInitialized = false;

async function initializeAudio() {
    if (isAudioInitialized) return;

    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });
        isAudioInitialized = true;
    } catch (error) {
        console.warn('Failed to initialize audio:', error);
    }
}

export const useSoundStore = create<SoundState>()(
    persist(
        (set, get) => ({
            // Default settings
            soundEnabled: true,
            musicEnabled: true,
            hapticsEnabled: true,
            soundVolume: 0.8,
            musicVolume: 0.5,

            // Runtime state (not persisted)
            backgroundMusic: null,
            currentTrack: null,
            isPlaying: false,

            setSoundEnabled: (enabled: boolean) => {
                set({ soundEnabled: enabled });
            },

            setMusicEnabled: async (enabled: boolean) => {
                set({ musicEnabled: enabled });
                if (!enabled) {
                    await get().stopBackgroundMusic();
                }
            },

            setHapticsEnabled: (enabled: boolean) => {
                set({ hapticsEnabled: enabled });
            },

            setSoundVolume: (volume: number) => {
                set({ soundVolume: Math.max(0, Math.min(1, volume)) });
            },

            setMusicVolume: async (volume: number) => {
                const clampedVolume = Math.max(0, Math.min(1, volume));
                set({ musicVolume: clampedVolume });

                // Update currently playing music volume
                const { backgroundMusic } = get();
                if (backgroundMusic) {
                    try {
                        await backgroundMusic.setVolumeAsync(clampedVolume);
                    } catch (error) {
                        console.warn('Failed to set music volume:', error);
                    }
                }
            },

            playSound: async (soundName: SoundName) => {
                const { soundEnabled, soundVolume } = get();
                if (!soundEnabled) return;

                const url = SOUND_URLS[soundName];
                if (!url) return;

                await initializeAudio();

                try {
                    // Check cache first
                    let sound = soundCache.get(url);

                    if (!sound) {
                        // Load from URL
                        const { sound: newSound } = await Audio.Sound.createAsync(
                            { uri: url },
                            { volume: soundVolume, shouldPlay: false }
                        );
                        sound = newSound;
                        soundCache.set(url, sound);
                    } else {
                        // Reset position and volume
                        await sound.setPositionAsync(0);
                        await sound.setVolumeAsync(soundVolume);
                    }

                    await sound.playAsync();
                } catch (error) {
                    // Silently fail - network issues shouldn't crash the game
                    console.warn(`Failed to play sound ${soundName}:`, error);
                }
            },

            playBackgroundMusic: async (track: MusicTrack) => {
                const { musicEnabled, musicVolume, backgroundMusic, currentTrack } = get();

                if (!musicEnabled) return;
                if (currentTrack === track) return;

                const url = MUSIC_URLS[track];
                if (!url) return;

                await initializeAudio();

                try {
                    // Stop current music
                    if (backgroundMusic) {
                        await backgroundMusic.stopAsync();
                        await backgroundMusic.unloadAsync();
                    }

                    // Load and play new track
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: url },
                        {
                            volume: musicVolume,
                            isLooping: true,
                            shouldPlay: true,
                        }
                    );

                    set({
                        backgroundMusic: sound,
                        currentTrack: track,
                        isPlaying: true,
                    });
                } catch (error) {
                    console.warn(`Failed to play music ${track}:`, error);
                }
            },

            stopBackgroundMusic: async () => {
                const { backgroundMusic } = get();

                if (backgroundMusic) {
                    try {
                        await backgroundMusic.stopAsync();
                        await backgroundMusic.unloadAsync();
                    } catch (error) {
                        console.warn('Failed to stop music:', error);
                    }
                }

                set({
                    backgroundMusic: null,
                    currentTrack: null,
                    isPlaying: false,
                });
            },

            pauseBackgroundMusic: async () => {
                const { backgroundMusic } = get();

                if (backgroundMusic) {
                    try {
                        await backgroundMusic.pauseAsync();
                        set({ isPlaying: false });
                    } catch (error) {
                        console.warn('Failed to pause music:', error);
                    }
                }
            },

            resumeBackgroundMusic: async () => {
                const { backgroundMusic, musicEnabled } = get();

                if (backgroundMusic && musicEnabled) {
                    try {
                        await backgroundMusic.playAsync();
                        set({ isPlaying: true });
                    } catch (error) {
                        console.warn('Failed to resume music:', error);
                    }
                }
            },

            cleanup: async () => {
                // Clean up sound cache
                for (const sound of soundCache.values()) {
                    try {
                        await sound.unloadAsync();
                    } catch (error) {
                        // Ignore errors during cleanup
                    }
                }
                soundCache.clear();

                // Clean up background music
                await get().stopBackgroundMusic();
            },
        }),
        {
            name: 'time-postman-sound-settings',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                soundEnabled: state.soundEnabled,
                musicEnabled: state.musicEnabled,
                hapticsEnabled: state.hapticsEnabled,
                soundVolume: state.soundVolume,
                musicVolume: state.musicVolume,
            }),
        }
    )
);

// Helper hook for haptic feedback
import * as Haptics from 'expo-haptics';

export function useHaptics() {
    const hapticsEnabled = useSoundStore((state) => state.hapticsEnabled);

    return {
        light: () => hapticsEnabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        medium: () => hapticsEnabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
        heavy: () => hapticsEnabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
        success: () => hapticsEnabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
        warning: () => hapticsEnabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
        error: () => hapticsEnabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
        selection: () => hapticsEnabled && Haptics.selectionAsync(),
    };
}
