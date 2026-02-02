import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { MenuScreen } from './src/screens/MenuScreen';
import { WorldSelectScreen } from './src/screens/WorldSelectScreen';
import { LevelSelectScreen } from './src/screens/LevelSelectScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AchievementScreen } from './src/screens/AchievementScreen';
import { TutorialOverlay } from './src/components/ui/TutorialOverlay';
import { WorldType } from './src/types';
import { getLevelsByWorld } from './src/utils/levelLoader';
import { useTutorialStore } from './src/stores/tutorialStore';
import { useSoundStore } from './src/stores/soundStore';

type Screen =
  | { name: 'menu' }
  | { name: 'worldSelect' }
  | { name: 'levelSelect'; world: WorldType }
  | { name: 'game'; world: WorldType; levelId: number }
  | { name: 'shop' }
  | { name: 'settings' }
  | { name: 'achievements' };

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ name: 'menu' });
  const { startTutorial, hasCompletedTutorial } = useTutorialStore();
  const { playBackgroundMusic, stopBackgroundMusic, musicEnabled } = useSoundStore();

  // Check tutorial on app start
  useEffect(() => {
    // Show tutorial for first-time users
    if (!hasCompletedTutorial) {
      startTutorial('tutorial');
    }
  }, []);

  // Handle music based on screen changes
  useEffect(() => {
    if (!musicEnabled) return;
    
    if (currentScreen.name === 'menu' || currentScreen.name === 'worldSelect' || currentScreen.name === 'levelSelect' || currentScreen.name === 'shop' || currentScreen.name === 'settings' || currentScreen.name === 'achievements') {
      playBackgroundMusic('menu');
    } else if (currentScreen.name === 'game') {
      // Play world-specific music
      playBackgroundMusic(currentScreen.world);
    }
  }, [currentScreen, musicEnabled]);

  const navigateToMenu = () => {
    setCurrentScreen({ name: 'menu' });
  };

  const navigateToWorldSelect = () => {
    setCurrentScreen({ name: 'worldSelect' });
  };

  const navigateToLevelSelect = (world: WorldType) => {
    setCurrentScreen({ name: 'levelSelect', world });
  };

  const navigateToGame = (world: WorldType, levelId: number) => {
    setCurrentScreen({ name: 'game', world, levelId });
  };

  const navigateToShop = () => {
    setCurrentScreen({ name: 'shop' });
  };

  const navigateToSettings = () => {
    setCurrentScreen({ name: 'settings' });
  };

  const navigateToAchievements = () => {
    setCurrentScreen({ name: 'achievements' });
  };

  const navigateToNextLevel = (world: WorldType, currentLevelId: number) => {
    const levels = getLevelsByWorld(world);
    const nextLevel = levels.find(l => l.id === currentLevelId + 1);

    if (nextLevel) {
      setCurrentScreen({ name: 'game', world, levelId: nextLevel.id });
    } else {
      // No more levels in this world, go back to world select
      navigateToWorldSelect();
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {currentScreen.name === 'menu' && (
        <MenuScreen
          onPlay={navigateToWorldSelect}
          onAlbum={navigateToShop}
          onSettings={navigateToSettings}
          onAchievements={navigateToAchievements}
        />
      )}

      {currentScreen.name === 'worldSelect' && (
        <WorldSelectScreen
          onBack={navigateToMenu}
          onSelectWorld={navigateToLevelSelect}
        />
      )}

      {currentScreen.name === 'levelSelect' && (
        <LevelSelectScreen
          world={currentScreen.world}
          onBack={navigateToWorldSelect}
          onSelectLevel={(levelId) => navigateToGame(currentScreen.world, levelId)}
        />
      )}

      {currentScreen.name === 'game' && (
        <GameScreen
          world={currentScreen.world}
          levelId={currentScreen.levelId}
          onBack={() => navigateToLevelSelect(currentScreen.world)}
          onNextLevel={() => navigateToNextLevel(currentScreen.world, currentScreen.levelId)}
        />
      )}

      {currentScreen.name === 'shop' && (
        <ShopScreen onBack={navigateToMenu} />
      )}

      {currentScreen.name === 'settings' && (
        <SettingsScreen onBack={navigateToMenu} />
      )}

      {currentScreen.name === 'achievements' && (
        <AchievementScreen onBack={navigateToMenu} />
      )}

      {/* Tutorial Overlay - Shows on first launch */}
      <TutorialOverlay />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
});
