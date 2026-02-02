import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetArea?: 'draw' | 'launch' | 'ink' | 'goal' | 'obstacle';
    highlightRect?: { x: number; y: number; width: number; height: number };
    action?: 'draw' | 'launch' | 'wait';
}

interface TutorialState {
    // Tutorial progress
    hasCompletedTutorial: boolean;
    currentStepIndex: number;
    tutorialSteps: TutorialStep[];

    // Tutorial active state
    isShowingTutorial: boolean;
    tutorialLevel: string | null;

    // Actions
    startTutorial: (levelId: string) => void;
    nextStep: () => void;
    previousStep: () => void;
    skipTutorial: () => void;
    completeTutorial: () => void;
    resetTutorial: () => void;

    // Getters (as functions)
    isActive: () => boolean;
    currentStep: () => TutorialStep | null;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;
    getCurrentStep: () => TutorialStep | null;
    getCurrentStepIndex: () => number;
    getTotalSteps: () => number;
    isLastStep: () => boolean;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Hoş Geldin, Zaman Postacısı!',
        description: 'Mektupları doğru çağlara ulaştırmak senin görevin. Hadi başlayalım!',
    },
    {
        id: 'goal',
        title: 'Hedef: Posta Kutusu',
        description: 'Yeşil posta kutusu hedefin. Mektubu buraya ulaştırmalısın.',
        targetArea: 'goal',
    },
    {
        id: 'envelope',
        title: 'Mektup',
        description: 'Bu senin mektubun. Çizeceğin çizgi üzerinde kayarak hedefe ulaşacak.',
    },
    {
        id: 'draw',
        title: 'Çizgi Çiz',
        description: 'Parmağını ekrana basılı tutarak bir çizgi çiz. Mektup bu çizgi üzerinde kayacak.',
        targetArea: 'draw',
        action: 'draw',
    },
    {
        id: 'ink',
        title: 'Mürekkep Sınırı',
        description: 'Üstteki çubuk mürekkep miktarını gösteriyor. Dikkatli kullan!',
        targetArea: 'ink',
    },
    {
        id: 'launch',
        title: 'Gönder!',
        description: 'Çizgiyi tamamladıktan sonra "GÖNDER" butonuna bas.',
        targetArea: 'launch',
        action: 'launch',
    },
    {
        id: 'physics',
        title: 'Fizik Kuralları',
        description: 'Mektup yerçekiminden etkilenir ve çizdiğin çizgilerden zıplar.',
    },
    {
        id: 'stars',
        title: 'Yıldızlar',
        description: 'Ne kadar az mürekkep kullanırsan o kadar çok yıldız kazanırsın!',
    },
    {
        id: 'complete',
        title: 'Hazırsın!',
        description: 'Artık zaman postacısı olmaya hazırsın. İyi teslimatlar!',
    },
];

export const useTutorialStore = create<TutorialState>()(
    persist(
        (set, get) => ({
            hasCompletedTutorial: false,
            currentStepIndex: 0,
            tutorialSteps: TUTORIAL_STEPS,
            isShowingTutorial: false,
            tutorialLevel: null,

            // Computed state as functions
            isActive: () => get().isShowingTutorial,
            
            currentStep: () => {
                const { currentStepIndex, tutorialSteps, isShowingTutorial } = get();
                if (!isShowingTutorial) return null;
                return tutorialSteps[currentStepIndex] || null;
            },
            
            canGoNext: () => {
                const { currentStepIndex, tutorialSteps } = get();
                return currentStepIndex < tutorialSteps.length - 1;
            },
            
            canGoPrevious: () => get().currentStepIndex > 0,

            startTutorial: (levelId: string) => {
                set({
                    isShowingTutorial: true,
                    tutorialLevel: levelId,
                    currentStepIndex: 0,
                });
            },

            nextStep: () => {
                const { currentStepIndex, tutorialSteps } = get();
                if (currentStepIndex < tutorialSteps.length - 1) {
                    set({ currentStepIndex: currentStepIndex + 1 });
                } else {
                    get().completeTutorial();
                }
            },

            previousStep: () => {
                const { currentStepIndex } = get();
                if (currentStepIndex > 0) {
                    set({ currentStepIndex: currentStepIndex - 1 });
                }
            },

            skipTutorial: () => {
                set({
                    hasCompletedTutorial: true,
                    isShowingTutorial: false,
                    tutorialLevel: null,
                    currentStepIndex: 0,
                });
            },

            completeTutorial: () => {
                set({
                    hasCompletedTutorial: true,
                    isShowingTutorial: false,
                    tutorialLevel: null,
                    currentStepIndex: 0,
                });
            },

            resetTutorial: () => {
                set({
                    hasCompletedTutorial: false,
                    currentStepIndex: 0,
                    isShowingTutorial: false,
                    tutorialLevel: null,
                });
            },

            getCurrentStep: () => {
                const { currentStepIndex, tutorialSteps, isShowingTutorial } = get();
                if (!isShowingTutorial) return null;
                return tutorialSteps[currentStepIndex] || null;
            },

            getCurrentStepIndex: () => {
                return get().currentStepIndex;
            },

            getTotalSteps: () => {
                return get().tutorialSteps.length;
            },

            isLastStep: () => {
                const { currentStepIndex, tutorialSteps } = get();
                return currentStepIndex === tutorialSteps.length - 1;
            },
        }),
        {
            name: 'time-postman-tutorial',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                hasCompletedTutorial: state.hasCompletedTutorial,
            }),
        }
    )
);