import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { MenuScreen } from './src/screens/MenuScreen';
import { LevelSelectScreen } from './src/screens/LevelSelectScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WorldType } from './src/types';
import { getLevelsByWorld } from './src/utils/levelLoader';

type Screen =
  | { name: 'menu' }
  | { name: 'levelSelect'; world: WorldType }
  | { name: 'game'; world: WorldType; levelId: number }
  | { name: 'shop' }
  | { name: 'settings' };

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ name: 'menu' });

  const navigateToMenu = () => {
    setCurrentScreen({ name: 'menu' });
  };

  const navigateToLevelSelect = (world: WorldType = 'stone_age') => {
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

  const navigateToNextLevel = (world: WorldType, currentLevelId: number) => {
    const levels = getLevelsByWorld(world);
    const nextLevel = levels.find(l => l.id === currentLevelId + 1);

    if (nextLevel) {
      setCurrentScreen({ name: 'game', world, levelId: nextLevel.id });
    } else {
      // No more levels, go back to level select
      navigateToLevelSelect(world);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {currentScreen.name === 'menu' && (
        <MenuScreen
          onPlay={() => navigateToLevelSelect('stone_age')}
          onAlbum={navigateToShop}
          onSettings={navigateToSettings}
        />
      )}

      {currentScreen.name === 'levelSelect' && (
        <LevelSelectScreen
          world={currentScreen.world}
          onBack={navigateToMenu}
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
});
