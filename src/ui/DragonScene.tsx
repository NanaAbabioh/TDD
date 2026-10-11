// Dragon Hoard: build a number on a ten-space tray. A full tray closes into
// a see-through chest of ten, so a teen number is one chest and some more.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DragonTask, evaluateHoard, startHoard } from '../activity/dragonGame';
import { Hoard, TRAY_SIZE, addCoin, hoardTotal, pack, removeCoin, unpack } from '../model/hoard';
import type { Attempt } from '../record/learningRecord';
import type { Settings } from '../record/storage';
import { dragonFeedback, dragonPrompt, numberWord } from '../voice/lines';
import { AFTER_BELL, Sound, playSound } from '../voice/sounds';
import { hush, say } from '../voice/speak';
import type { Mood } from './art';
import { ChunkyButton } from './ChunkyButton';
import { Confetti } from './Confetti';
import { DinoActor } from './DinoActor';
import { Hud } from './Hud';
import { NumberPop } from './NumberPop';
import { SUN } from './theme';
import { World } from './World';
import { Chest, LidIcon, Pile, TreasureArt } from './worldArt';

type Phase = 'play' | 'feedback' | 'celebrate';

type Props = {
  task: DragonTask;
  session: number;
  settings: Settings;
  progress: { position: number; length: number };
  onFinish: (attempt?: Attempt) => void;
  onExit: () => void;
};

const BELL = 76;

export function DragonScene({ task, session, settings, progress, onFinish, onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const calm = settings.reducedMotion;

  const [hoard, setHoard] = useState(startHoard);
  const [phase, setPhase] = useState<Phase>('play');
  // After the first commit the total is shown, so the child can see what they made.
  const [revealed, setRevealed] = useState(false);
  const [helpShown, setHelpShown] = useState(false);
  const [caption, setCaption] = useState('');

  const stats = useRef({
    commits: 0,
    firstGiven: 0,
    firstCorrect: false,
    changesBeforeCommit: 0,
    idleTaps: 0,
    changes: 0,
    replays: 0,
  }).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]).current;
  const later = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));

  const speak = (text: string) => {
    setCaption(text);
    say(text, settings.voice);
  };

  useEffect(() => {
    later(500, () => speak(dragonPrompt(task)));
    return () => {
      timers.forEach(clearTimeout);
      hush();
    };
  }, []);

  // With help, every piece is counted aloud and the running total is shown.
  const supports = task.support === 'supported' || helpShown;
  const total = hoardTotal(hoard);
  const wrongShown = revealed && phase !== 'celebrate' && total !== task.target;

  const left = insets.left + 12;
  const right = width - insets.right - 12;
  const top = insets.top + 12;
  const bottom = height - insets.bottom - 12;
  const cell = Math.min(height * 0.17, width * 0.085);
  const trayW = cell * 5 + 20;
  const trayH = cell * 2 + 20;
  const trayX = left + width * 0.2;
  const trayY = bottom - trayH - 6;
  const pileSize = Math.min(height * 0.36, width * 0.17);
  const chestW = cell * 1.55;
  const shelfY = top + 58;
  const dragon = Math.min(height * 0.46, width * 0.23);
  const numeral = Math.min(height * 0.2, 84);

  // Each change goes through the model; a change that is not allowed does nothing.
  const change = (next: Hoard, line?: string, sound?: Sound) => {
    if (phase !== 'play') return;
    if (next === hoard) {
      stats.idleTaps++;
      return;
    }
    stats.changes++;
    playSound(sound ?? (hoardTotal(next) < hoardTotal(hoard) ? 'pop' : 'coin'));
    setHoard(next);
    if (supports) speak(line ?? numberWord(hoardTotal(next)));
  };

  const takeBack = () => {
    if (hoard.tray > 0 && stats.commits === 0) stats.changesBeforeCommit++;
    change(removeCoin(hoard));
  };

  const finish = () => {
    onFinish({
      at: Date.now(),
      session,
      skill: 'hoard',
      quantity: task.target,
      theme: task.treasure,
      arrangement: task.target > TRAY_SIZE ? 'chest-and-more' : 'tray',
      support: task.support,
      firstGiven: stats.firstGiven,
      firstCorrect: stats.firstCorrect,
      commits: stats.commits,
      help: helpShown ? 'shown' : 'none',
      changesBeforeCommit: stats.changesBeforeCommit,
      idleDrags: stats.idleTaps,
      replays: stats.replays,
    });
  };

  const commit = () => {
    if (phase !== 'play') return;
    const result = evaluateHoard(task, hoard);
    stats.commits++;
    if (stats.commits === 1) {
      stats.firstGiven = result.given;
      stats.firstCorrect = result.correct;
    }
    playSound('bell');
    later(AFTER_BELL, () => {
      playSound(result.correct ? 'success' : 'retry');
      if (result.correct) playSound('cheer');
    });
    const line = dragonFeedback(task, result.correct, result.given, progress.position + task.target);
    later(AFTER_BELL + (result.correct ? 500 : 350), () => speak(line));
    setRevealed(true);

    if (!result.correct) {
      if (stats.commits >= 2) setHelpShown(true);
      setPhase('feedback');
      later(1200, () => setPhase('play'));
      return;
    }
    setPhase('celebrate');
    later(5600, finish);
  };

  const replay = () => {
    stats.replays++;
    speak(dragonPrompt(task));
  };

  const mood: Mood = phase === 'celebrate' ? 'happy' : wrongShown ? 'waiting' : 'idle';

  return (
    <Animated.View entering={calm ? undefined : FadeIn.duration(280)} style={styles.fill}>
      <World theme="dragon" width={width} height={height} reducedMotion={calm} />

      <Pressable
        onPress={() => change(addCoin(hoard))}
        accessibilityLabel={`Take one of the ${task.treasure}`}
        style={({ pressed }) => ({
          position: 'absolute',
          left: left + 6,
          top: trayY + (trayH - pileSize) / 2,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        })}
      >
        <Pile size={pileSize} treasure={task.treasure} />
      </Pressable>

      {/* The ten-space tray: two rows of five, filled left to right. */}
      <Pressable
        onPress={takeBack}
        accessibilityLabel="Take one back"
        style={[styles.tray, { left: trayX, top: trayY, width: trayW, height: trayH }]}
      >
        {Array.from({ length: TRAY_SIZE }, (_, index) => (
          <View
            key={index}
            style={[
              styles.space,
              {
                left: 10 + (index % 5) * cell + cell * 0.08,
                top: 10 + Math.floor(index / 5) * cell + cell * 0.08,
                width: cell * 0.84,
                height: cell * 0.84,
                borderRadius: cell * 0.42,
              },
            ]}
          >
            {index < hoard.tray && (
              <Animated.View entering={calm ? undefined : ZoomIn.duration(180)}>
                <TreasureArt treasure={task.treasure} size={cell * 0.8} />
              </Animated.View>
            )}
          </View>
        ))}
      </Pressable>

      {hoard.tray === TRAY_SIZE && (
        <Animated.View
          entering={calm ? undefined : ZoomIn.duration(220)}
          style={{ position: 'absolute', left: trayX + trayW + 12, top: trayY + trayH / 2 - 38 }}
        >
          <ChunkyButton
            size={68}
            color={SUN}
            shade="#D9981A"
            label="Close the ten into a chest"
            disabled={phase !== 'play'}
            quiet
            onPress={() => change(pack(hoard), `Ten ${task.treasure}. One chest!`, 'chest')}
          >
            <LidIcon size={44} />
          </ChunkyButton>
        </Animated.View>
      )}

      {Array.from({ length: hoard.chests }, (_, index) => (
        <Pressable
          key={index}
          onPress={() => change(unpack(hoard), 'Ten again!', 'plop')}
          accessibilityLabel="Open the chest"
          style={{ position: 'absolute', left: trayX + index * (chestW + 10), top: shelfY }}
        >
          <Animated.View entering={calm ? undefined : ZoomIn.duration(240)}>
            <Chest width={chestW} treasure={task.treasure} />
          </Animated.View>
        </Pressable>
      ))}

      <View style={[styles.untouchable, { position: 'absolute', left: right - dragon - 2, top: top - 6 }]}>
        <DinoActor size={dragon} variant={0} mood={mood} reducedMotion={calm} dragon />
      </View>

      {/* The total, shown with every count aloud and after each ring of the bell. */}
      {((supports && stats.changes > 0) || revealed) && (
        <NumberPop
          key={`${total}-${phase === 'celebrate'}`}
          value={total}
          size={numeral}
          burst={1.9}
          reducedMotion={calm}
          tone={wrongShown ? 'alert' : 'sun'}
          style={{ left: right - dragon - numeral - 26, top: top + 52 }}
        />
      )}

      {phase === 'celebrate' && !calm && (
        <Confetti x={right - dragon / 2} y={top + dragon * 0.5} spread={height * 0.55} />
      )}

      <Hud
        left={left}
        top={insets.top + 6}
        bottom={height - (insets.top + 66 + 38)}
        captionWidth={width * 0.19}
        caption={caption}
        progress={progress}
        bell={{ x: right - BELL / 2, y: bottom - BELL / 2, size: BELL, disabled: phase !== 'play' }}
        onExit={onExit}
        onReplay={replay}
        onCommit={commit}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#F8C9B6' },
  untouchable: { pointerEvents: 'none' },
  tray: {
    position: 'absolute',
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#4A3478',
    backgroundColor: '#7B5CC0',
  },
  space: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
});
