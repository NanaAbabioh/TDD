import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Attempt } from './src/record/learningRecord';
import { SaveData, Settings, emptySave, loadSave, writeSave } from './src/record/storage';
import { HomeScreen } from './src/ui/HomeScreen';
import { setMusic } from './src/voice/music';
import { setSoundEnabled } from './src/voice/sounds';
import { ParentScreen } from './src/ui/ParentScreen';
import { Game, PlayScreen } from './src/ui/PlayScreen';

type Screen = 'home' | 'parents' | Game;

export default function App() {
  const [save, setSave] = useState<SaveData>();
  const [screen, setScreen] = useState<Screen>('home');
  const [fontsReady] = useFonts({ Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });

  useEffect(() => {
    loadSave().then(setSave);
  }, []);

  // Each world has its own track; the home and grown-ups' screens share one.
  const musicOn = save?.settings.music;
  const soundOn = save?.settings.sound;
  useEffect(() => {
    setSoundEnabled(soundOn ?? true);
  }, [soundOn]);
  useEffect(() => {
    if (!musicOn) return setMusic(undefined);
    setMusic(screen === 'parents' ? 'home' : screen);
  }, [musicOn, screen]);

  const update = (next: SaveData) => {
    setSave(next);
    writeSave(next);
  };

  // Saved after every attempt, so an interrupted session loses nothing.
  const recordAttempt = (attempt: Attempt) => {
    if (!save) return;
    update({
      ...save,
      sessions: Math.max(save.sessions, attempt.session),
      attempts: [...save.attempts, attempt],
    });
  };

  const ready = save !== undefined && fontsReady;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar hidden />
        {!ready && <View style={{ flex: 1, backgroundColor: '#DFF7EC' }} />}
        {ready && screen === 'home' && (
          <HomeScreen
            reducedMotion={save.settings.reducedMotion}
            voice={save.settings.voice}
            onPlay={setScreen}
            onParents={() => setScreen('parents')}
          />
        )}
        {ready && screen !== 'home' && screen !== 'parents' && (
          <PlayScreen
            key={screen}
            game={screen}
            save={save}
            onAttempt={recordAttempt}
            onExit={() => setScreen('home')}
          />
        )}
        {ready && screen === 'parents' && (
          <ParentScreen
            save={save}
            onSettings={(settings: Settings) => update({ ...save, settings })}
            onReset={() => update({ ...emptySave(), settings: save.settings })}
            onBack={() => setScreen('home')}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
