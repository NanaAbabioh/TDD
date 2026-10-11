// Number Path: a grid of numbered tiles. Starting on 0, the child taps the
// neighbouring tile that comes next, laying a path to the station or the nest.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PathTask, buildMaze, missesAllowed } from '../activity/pathGame';
import { tapTile } from '../model/maze';
import type { Attempt } from '../record/learningRecord';
import type { Settings } from '../record/storage';
import { numberWord, pathAsk, pathDone, pathPrompt } from '../voice/lines';
import { playSound } from '../voice/sounds';
import { hush, say } from '../voice/speak';
import { Confetti } from './Confetti';
import { Hud } from './Hud';
import { NumberPop } from './NumberPop';
import { CORAL, CREAM, FONT, INK } from './theme';
import { World } from './World';
import { Dino } from './art';
import { Dragon, ENGINE_RATIO, Engine, GoalIcon } from './worldArt';

type Props = {
  task: PathTask;
  session: number;
  settings: Settings;
  progress: { position: number; length: number };
  onFinish: (attempt?: Attempt) => void;
  onExit: () => void;
};

const LAID = { train: '#FFD45C', dragon: '#D3B4F2', dino: '#BFEBAE' };
const SCENE = { train: 'train', dragon: 'dragon', dino: 'leaves' } as const;

// The tile to try next, shown gently after two misses on the same step.
function Glow({ size, still }: { size: number; still: boolean }) {
  const beat = useSharedValue(0.25);
  useEffect(() => {
    if (still) return;
    beat.value = withRepeat(withTiming(1, { duration: 650 }), -1, true);
  }, [still]);
  const style = useAnimatedStyle(() => ({ opacity: beat.value }));
  return <Animated.View style={[styles.glow, { width: size, height: size, borderRadius: size * 0.24 }, style]} />;
}

export function PathScene({ task, session, settings, progress, onFinish, onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const calm = settings.reducedMotion;
  const maze = useMemo(() => buildMaze(task), [task]);

  // The highest number the path has reached so far.
  const [reached, setReached] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [hint, setHint] = useState(false);
  const [wrongTile, setWrongTile] = useState<number>();
  const [caption, setCaption] = useState('');

  const stats = useRef({
    taps: 0,
    misses: 0,
    missesHere: 0,
    firstTry: 0,
    farTaps: 0,
    hinted: false,
    replays: 0,
  }).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]).current;
  const later = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));

  const speak = (text: string) => {
    setCaption(text);
    say(text, settings.voice);
  };

  useEffect(() => {
    later(500, () => speak(pathPrompt(task)));
    return () => {
      timers.forEach(clearTimeout);
      hush();
    };
  }, []);

  const left = insets.left + 12;
  const right = width - insets.right - 12;
  const top = insets.top + 66;
  const bottom = height - insets.bottom - 10;
  const cell = Math.min((right - left) / task.cols, (bottom - top) / task.rows);
  const gridX = left + (right - left - cell * task.cols) / 2;
  const gridY = top + (bottom - top - cell * task.rows) / 2;
  const tile = cell - 6;
  const centre = (index: number) => ({
    x: gridX + ((index % task.cols) + 0.5) * cell,
    y: gridY + (Math.floor(index / task.cols) + 0.5) * cell,
  });

  const head = centre(maze.path[reached]);
  const mover = cell * 0.52;
  const moverX = useSharedValue(head.x);
  const moverY = useSharedValue(head.y);
  useEffect(() => {
    const glide = (to: number) =>
      calm ? withTiming(to, { duration: 1 }) : withSpring(to, { damping: 15, stiffness: 150 });
    moverX.value = glide(head.x);
    moverY.value = glide(head.y);
  }, [head.x, head.y]);
  const moverStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: moverX.value + cell * 0.29 - mover / 2 },
      { translateY: moverY.value + cell * 0.27 - mover / 2 },
    ],
  }));

  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const finish = () => {
    onFinish({
      at: Date.now(),
      session,
      skill: 'path',
      quantity: task.last,
      theme: task.traveller,
      arrangement: `${task.cols}x${task.rows}`,
      support: task.support,
      // Steps found at the first tap, out of task.last.
      firstGiven: stats.firstTry,
      firstCorrect: stats.misses <= missesAllowed(task.last) && !stats.hinted,
      commits: stats.taps,
      help: stats.hinted ? 'shown' : 'none',
      changesBeforeCommit: 0,
      idleDrags: stats.farTaps,
      replays: stats.replays,
    });
  };

  const tap = (index: number) => {
    if (celebrating) return;
    const result = tapTile(maze, reached, index);
    if (result === 'far') {
      stats.farTaps++;
      return;
    }
    stats.taps++;
    if (result === 'wrong') {
      stats.misses++;
      stats.missesHere++;
      playSound('retry');
      setWrongTile(index);
      if (!calm) {
        shake.value = withSequence(
          withTiming(-6, { duration: 60 }),
          withTiming(6, { duration: 60 }),
          withTiming(-4, { duration: 60 }),
          withTiming(0, { duration: 60 }),
        );
      }
      later(700, () => setWrongTile(undefined));
      later(350, () => speak(pathAsk(reached)));
      // Two misses on one step: show where to look rather than repeat the question.
      if (stats.missesHere >= 2) {
        stats.hinted = true;
        setHint(true);
      }
      return;
    }

    if (stats.missesHere === 0) stats.firstTry++;
    stats.missesHere = 0;
    setHint(false);
    const now = reached + 1;
    setReached(now);
    playSound(task.traveller === 'train' ? 'chuff' : 'plop');
    speak(numberWord(now));
    if (now < task.last) return;

    setCelebrating(true);
    later(900, () => {
      playSound(task.traveller === 'train' ? 'whistle' : 'success');
      if (task.traveller !== 'train') playSound('cheer');
    });
    later(1900, () => speak(pathDone(task, progress.position + task.last)));
    later(7200, finish);
  };

  const replay = () => {
    stats.replays++;
    speak(reached === 0 ? pathPrompt(task) : `What comes after ${numberWord(reached)}?`);
  };

  const laid = LAID[task.traveller];
  const goal = maze.path[task.last];
  const next = maze.path[reached + 1];

  return (
    <Animated.View entering={calm ? undefined : FadeIn.duration(280)} style={styles.fill}>
      <World theme={SCENE[task.traveller]} width={width} height={height} reducedMotion={calm} />

      {maze.values.map((value, index) => {
        const spot = centre(index);
        const order = maze.path.indexOf(index);
        const onPath = order !== -1 && order <= reached;
        const isWrong = wrongTile === index;
        return (
          <Animated.View
            key={index}
            style={[
              { position: 'absolute', left: spot.x - tile / 2, top: spot.y - tile / 2 },
              isWrong && shakeStyle,
            ]}
          >
            {hint && index === next && <Glow size={tile} still={calm} />}
            <Pressable
              onPress={() => tap(index)}
              accessibilityLabel={`Tile ${value}`}
              style={[
                styles.tile,
                { width: tile, height: tile, borderRadius: tile * 0.24 },
                onPath && { backgroundColor: laid, borderWidth: 3.5 },
                isWrong && styles.wrong,
              ]}
            >
              <Text style={[styles.number, { fontSize: tile * (value > 9 ? 0.44 : 0.52), lineHeight: tile * 0.7 }]}>
                {value}
              </Text>
            </Pressable>
            {index === goal && (
              <View style={[styles.goal, { right: -tile * 0.14, top: -tile * 0.2 }]}>
                <GoalIcon size={tile * 0.5} place={task.traveller} />
              </View>
            )}
          </Animated.View>
        );
      })}

      <Animated.View style={[styles.untouchable, { position: 'absolute', left: 0, top: 0 }, moverStyle]}>
        {task.traveller === 'train' ? (
          <View style={{ width: mover, height: mover, alignItems: 'center', justifyContent: 'center' }}>
            <Engine height={mover / ENGINE_RATIO} happy={celebrating} />
          </View>
        ) : task.traveller === 'dragon' ? (
          <Dragon size={mover} mood={celebrating ? 'happy' : 'idle'} />
        ) : (
          <Dino size={mover} variant={0} mood={celebrating ? 'happy' : 'idle'} />
        )}
      </Animated.View>

      {/* The number the path has reached, popping up as it is said. */}
      {!celebrating && (
        <NumberPop
          key={reached}
          value={reached}
          size={cell * 0.56}
          burst={2}
          pop={reached > 0}
          reducedMotion={calm}
          style={{ left: head.x - cell * 0.62, top: head.y - cell * 0.72 }}
        />
      )}

      {celebrating && !calm && <Confetti x={head.x} y={head.y} spread={height * 0.55} />}

      <Hud
        left={left}
        top={insets.top + 6}
        bottom={height - (insets.top + 12 + 38)}
        captionLeft={left + 190}
        captionWidth={width * 0.5}
        caption={caption}
        progress={progress}
        onExit={onExit}
        onReplay={replay}
        onCommit={() => {}}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#EAF4FF' },
  untouchable: { pointerEvents: 'none' },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: INK,
    backgroundColor: CREAM,
  },
  wrong: { borderColor: CORAL, borderStyle: 'dashed', borderWidth: 3.5 },
  number: { fontFamily: FONT.bold, color: INK, textAlign: 'center' },
  goal: { position: 'absolute', pointerEvents: 'none' },
  glow: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderWidth: 6,
    borderColor: '#fff',
    transform: [{ scale: 1.16 }],
  },
});
