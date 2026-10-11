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
import { Game, PlayScreen, WorldId } from './src/ui/PlayScreen';
import { WorldMenu } from './src/ui/WorldMenu';

// Home shows the three worlds; a world shows its games; a game is played inside its world.
type Screen =
  | { name: 'home' }
  | { name: 'parents' }
  | { name: 'world'; world: WorldId }
  | { name: 'play'; world: WorldId; game: Game };

export default function App() {
  const [save, setSave] = useState<SaveData>();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
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
    // A world's menu and all its games share that world's track.
    setMusic('world' in screen ? screen.world : 'home');
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
        {ready && screen.name === 'home' && (
          <HomeScreen
            reducedMotion={save.settings.reducedMotion}
            voice={save.settings.voice}
            onOpen={(world) => setScreen({ name: 'world', world })}
            onParents={() => setScreen({ name: 'parents' })}
          />
        )}
        {ready && screen.name === 'world' && (
          <WorldMenu
            key={screen.world}
            world={screen.world}
            reducedMotion={save.settings.reducedMotion}
            voice={save.settings.voice}
            onPlay={(game) => setScreen({ name: 'play', world: screen.world, game })}
            onHome={() => setScreen({ name: 'home' })}
          />
        )}
        {ready && screen.name === 'play' && (
          <PlayScreen
            key={`${screen.world}-${screen.game}`}
            world={screen.world}
            game={screen.game}
            save={save}
            onAttempt={recordAttempt}
            onExit={() => setScreen({ name: 'world', world: screen.world })}
          />
        )}
        {ready && screen.name === 'parents' && (
          <ParentScreen
            save={save}
            onSettings={(settings: Settings) => update({ ...save, settings })}
            onReset={() => update({ ...emptySave(), settings: save.settings })}
            onBack={() => setScreen({ name: 'home' })}
          />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
