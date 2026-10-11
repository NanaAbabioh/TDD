// Adding Up: two groups come together. The child can tap things to count
// them, picks the total on the number strip, and rings the bell.

import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AddTask } from '../activity/addGame';
import type { Attempt } from '../record/learningRecord';
import type { Settings } from '../record/storage';
import { ADD_COUNT, ADD_PICK, TRY_AGAIN, addPrompt, addRight, numberWord } from '../voice/lines';
import { AFTER_BELL, playSound } from '../voice/sounds';
import { hush, say } from '../voice/speak';
import { Dino, ItemArt } from './art';
import { ChunkyButton } from './ChunkyButton';
import { Confetti } from './Confetti';
import { Hud } from './Hud';
import { NumberPop } from './NumberPop';
import { useUiScale } from './scale';
import { CORAL, FONT, INK, SUN } from './theme';
import { World } from './World';
import { TreasureArt } from './worldArt';

type Phase = 'play' | 'counting' | 'celebrate';

type Props = {
  task: AddTask;
  session: number;
  settings: Settings;
  progress: { position: number; length: number };
  onFinish: (attempt?: Attempt) => void;
  onExit: () => void;
};

const SCENE = { dino: 'leaves', train: 'train', dragon: 'dragon' } as const;
const COVER = { dino: '#5FB868', train: '#6FA3DB', dragon: '#9478CC' };
// How long the second group stays in view before it is hidden, when playing without help.
const HIDE_AFTER = 7000;
const COUNT_PACE = 1150;

export function AddScene({ task, session, settings, progress, onFinish, onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const calm = settings.reducedMotion;
  const s = useUiScale();
  const BELL = 76 * s;
  const total = task.first + task.more;

  const [phase, setPhase] = useState<Phase>('play');
  const [picked, setPicked] = useState<number>();
  // Items in the order they were counted, by the child's taps or by the game.
  const [counted, setCounted] = useState<number[]>([]);
  const [covered, setCovered] = useState(false);
  const [helpShown, setHelpShown] = useState(false);
  const [caption, setCaption] = useState('');

  const stats = useRef({
    commits: 0,
    firstGiven: 0,
    firstCorrect: false,
    changesBeforeCommit: 0,
    replays: 0,
  }).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]).current;
  const later = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));

  const speak = (text: string) => {
    setCaption(text);
    say(text, settings.voice);
  };

  useEffect(() => {
    later(500, () => speak(addPrompt(task)));
    // Without help, the second group is seen arriving and then hidden, so it has to be held in mind.
    if (task.support === 'independent') later(HIDE_AFTER, () => setCovered(true));
    return () => {
      timers.forEach(clearTimeout);
      hush();
    };
  }, []);

  const left = insets.left + 12;
  const right = width - insets.right - 12;
  const top = insets.top + 66 * s;
  const bottom = height - insets.bottom - 12;
  const strip = Math.min(52 * s, (right - left - BELL - 24 - (task.top - 1) * 8) / task.top);
  const zoneBottom = bottom - strip - 22;
  // The gap between the two groups holds the plus sign.
  const plus = Math.min(76 * s, (right - left) * 0.1);
  const zoneGap = plus + 20;
  const zoneW = (right - left - zoneGap) / 2;
  const zoneH = zoneBottom - top;
  // Small groups are drawn larger; a row never holds more than five.
  const widest = Math.min(5, Math.max(task.first, task.more));
  const item = Math.min(zoneH * 0.44, zoneW / (widest + 0.9), 100 * s);

  // Where the item at this position in its group sits: rows of five, centred.
  const spot = (group: 0 | 1, order: number, size: number) => {
    const rows = Math.ceil(size / 5);
    const row = Math.floor(order / 5);
    const inRow = row === rows - 1 ? size - row * 5 : 5;
    const zoneX = left + group * (zoneW + zoneGap);
    return {
      x: zoneX + zoneW / 2 + ((order % 5) - (inRow - 1) / 2) * item * 1.08,
      y: top + zoneH / 2 + (row - (rows - 1) / 2) * item * 1.1,
    };
  };
  const spotOf = (id: number) =>
    id < task.first ? spot(0, id, task.first) : spot(1, id - task.first, task.more);

  const countOne = (id: number) => {
    if (phase !== 'play' || counted.includes(id) || (covered && id >= task.first)) return;
    playSound('pop');
    speak(numberWord(counted.length + 1));
    setCounted([...counted, id]);
  };

  const pick = (number: number) => {
    if (phase !== 'play') return;
    if (picked !== undefined && picked !== number && stats.commits === 0) stats.changesBeforeCommit++;
    setPicked(number);
    speak(numberWord(number));
  };

  const finish = () => {
    onFinish({
      at: Date.now(),
      session,
      skill: 'add',
      quantity: total,
      theme: task.world,
      arrangement: `${task.first}+${task.more}`,
      support: task.support,
      firstGiven: stats.firstGiven,
      firstCorrect: stats.firstCorrect,
      commits: stats.commits,
      help: helpShown ? 'shown' : 'none',
      changesBeforeCommit: stats.changesBeforeCommit,
      idleDrags: 0,
      replays: stats.replays,
    });
  };

  const commit = () => {
    if (phase !== 'play') return;
    if (picked === undefined) return speak(ADD_PICK);
    const correct = picked === total;
    stats.commits++;
    if (stats.commits === 1) {
      stats.firstGiven = picked;
      stats.firstCorrect = correct;
    }
    playSound('bell');

    if (correct) {
      setCovered(false);
      setPhase('celebrate');
      later(AFTER_BELL, () => {
        playSound('success');
        playSound('cheer');
      });
      later(AFTER_BELL + 500, () => speak(addRight(task, progress.position + total)));
      later(6200, finish);
      return;
    }

    // A miss is answered by counting everything together, one at a time.
    setPhase('counting');
    setHelpShown(true);
    setCovered(false);
    setCounted([]);
    later(AFTER_BELL, () => playSound('retry'));
    later(AFTER_BELL + 350, () => speak(ADD_COUNT));
    const start = AFTER_BELL + 3600;
    for (let i = 0; i < total; i++) {
      later(start + i * COUNT_PACE, () => {
        setCounted(Array.from({ length: i + 1 }, (_, id) => id));
        speak(numberWord(i + 1));
      });
    }
    later(start + total * COUNT_PACE + 400, () => {
      speak(TRY_AGAIN);
      setPicked(undefined);
      setPhase('play');
    });
  };

  const replay = () => {
    stats.replays++;
    speak(addPrompt(task));
  };

  const tagSize = item * 0.62;

  return (
    <Animated.View entering={calm ? undefined : FadeIn.duration(280)} style={styles.fill}>
      <World theme={SCENE[task.world]} width={width} height={height} reducedMotion={calm} />

      {[0, 1].map((group) => (
        <View
          key={group}
          style={[styles.mat, { left: left + group * (zoneW + zoneGap), top, width: zoneW, height: zoneH }]}
        />
      ))}

      {/* The plus sign: these and those, put together. */}
      <View
        style={[
          styles.plus,
          {
            left: left + zoneW + (zoneGap - plus) / 2,
            top: top + zoneH / 2 - plus / 2,
            width: plus,
            height: plus,
            borderRadius: plus / 2,
          },
        ]}
      >
        <Text style={[styles.plusText, { fontSize: plus * 0.86, lineHeight: plus * 0.98 }]}>+</Text>
      </View>

      {Array.from({ length: total }, (_, id) => {
        const at = spotOf(id);
        const second = id >= task.first;
        return (
          <Pressable
            key={id}
            onPress={() => countOne(id)}
            accessibilityLabel="Count this one"
            style={{ position: 'absolute', left: at.x - item / 2, top: at.y - item / 2 }}
          >
            {task.world === 'dino' ? (
              <Dino size={item} variant={second ? 2 : 0} mood={phase === 'celebrate' ? 'happy' : 'idle'} />
            ) : task.world === 'train' ? (
              <ItemArt theme="train" size={item} />
            ) : (
              <TreasureArt treasure="coins" size={item} />
            )}
          </Pressable>
        );
      })}

      {/* Count numerals pop above each item as it is counted. */}
      {counted.map((id, order) => {
        if (covered && id >= task.first) return null;
        const at = spotOf(id);
        return (
          <NumberPop
            key={`${id}-${order}`}
            value={order + 1}
            size={tagSize}
            burst={2}
            reducedMotion={calm}
            style={{ left: at.x - tagSize / 2, top: at.y - item * 0.5 - tagSize * 0.6 }}
          />
        );
      })}

      {covered && (
        <Animated.View
          entering={calm ? undefined : ZoomIn.duration(260)}
          style={[
            styles.cover,
            { left: left + zoneW + zoneGap, top, width: zoneW, height: zoneH, backgroundColor: COVER[task.world] },
          ]}
        >
          <Text style={[styles.coverText, { fontSize: zoneH * 0.5, lineHeight: zoneH * 0.62 }]}>?</Text>
        </Animated.View>
      )}

      <View style={[styles.strip, { left, top: bottom - strip - 6, gap: 8 }]}>
        {Array.from({ length: task.top }, (_, i) => i + 1).map((number) => (
          <ChunkyButton
            key={number}
            size={strip}
            color={picked === number ? SUN : '#fff'}
            shade={picked === number ? '#D9981A' : '#CFC7DE'}
            label={`Answer ${number}`}
            disabled={phase !== 'play'}
            onPress={() => pick(number)}
          >
            <Text style={[styles.stripText, { fontSize: strip * 0.56, lineHeight: strip * 0.72 }]}>{number}</Text>
          </ChunkyButton>
        ))}
      </View>

      {/* The whole sum, shown as numerals over the answer strip once it has been found. */}
      {phase === 'celebrate' && (
        <Animated.View
          entering={calm ? undefined : ZoomIn.duration(280)}
          style={[styles.sum, { top: bottom - 84 * s, left: (left + right - BELL) / 2 - 150 * s, width: 300 * s }]}
        >
          <Text style={[styles.sumText, { fontSize: 56 * s, lineHeight: 72 * s }]}>
            {task.first} + {task.more} = {total}
          </Text>
        </Animated.View>
      )}

      {phase === 'celebrate' && !calm && <Confetti x={width / 2} y={top + zoneH / 2} spread={height * 0.55} />}

      <Hud
        left={left}
        top={insets.top + 6}
        bottom={height - (insets.top + 12 + 38 * s)}
        captionLeft={left + 216 * s}
        captionWidth={width * 0.55}
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
  fill: { flex: 1, backgroundColor: '#DFF7EC' },
  mat: {
    position: 'absolute',
    borderRadius: 28,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  cover: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: INK,
  },
  coverText: { fontFamily: FONT.bold, color: '#fff', textAlign: 'center' },
  sum: {
    position: 'absolute',
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: INK,
    backgroundColor: SUN,
    pointerEvents: 'none',
  },
  sumText: { fontFamily: FONT.bold, fontSize: 56, lineHeight: 72, color: INK },
  plus: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: INK,
    backgroundColor: '#fff',
    pointerEvents: 'none',
  },
  plusText: { fontFamily: FONT.bold, color: CORAL, textAlign: 'center' },
  strip: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end' },
  stripText: { fontFamily: FONT.bold, color: INK, textAlign: 'center' },
});
