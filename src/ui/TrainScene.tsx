// Train Stops: the track is a number line. The child drives one stop at a
// time and rings the bell when they think they are at the stop asked for.

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TrainTask, evaluateDrive, startTrack } from '../activity/trainGame';
import { step } from '../model/track';
import type { Attempt } from '../record/learningRecord';
import type { Settings } from '../record/storage';
import { numberWord, trainFeedback, trainPrompt } from '../voice/lines';
import { playSound } from '../voice/sounds';
import { hush, say } from '../voice/speak';
import { ChunkyButton } from './ChunkyButton';
import { Confetti } from './Confetti';
import { Hud } from './Hud';
import { NumberPop } from './NumberPop';
import { CORAL, CREAM, FONT, INK, SUN } from './theme';
import { World } from './World';
import { ArrowIcon, ENGINE_RATIO, Engine } from './worldArt';

type Phase = 'play' | 'feedback' | 'celebrate';

type Props = {
  task: TrainTask;
  session: number;
  settings: Settings;
  progress: { position: number; length: number };
  onFinish: (attempt?: Attempt) => void;
  onExit: () => void;
};

const BELL = 76;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function TrainScene({ task, session, settings, progress, onFinish, onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const calm = settings.reducedMotion;

  const [track, setTrack] = useState(() => startTrack(task));
  const [phase, setPhase] = useState<Phase>('play');
  // After the first commit the stop numbers are shown, so the child can see where they are.
  const [revealed, setRevealed] = useState(false);
  const [helpShown, setHelpShown] = useState(false);
  const [caption, setCaption] = useState('');

  const stats = useRef({
    commits: 0,
    firstGiven: 0,
    firstCorrect: false,
    changesBeforeCommit: 0,
    idleMoves: 0,
    moves: 0,
    replays: 0,
  }).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]).current;
  const later = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));

  const speak = (text: string) => {
    setCaption(text);
    say(text, settings.voice);
  };

  useEffect(() => {
    later(500, () => speak(trainPrompt(task)));
    return () => {
      timers.forEach(clearTimeout);
      hush();
    };
  }, []);

  // With help, every stop wears its number and each move is counted aloud.
  const supports = task.support === 'supported' || helpShown;
  const showNumbers = supports || revealed;

  const left = insets.left + 12;
  const right = width - insets.right - 12;
  const bottom = height - insets.bottom - 12;
  const firstStop = left + 44;
  const gap = (right - 44 - firstStop) / task.last;
  const stopX = (index: number) => firstStop + index * gap;
  const railY = height * 0.5;
  const engine = clamp(Math.min(height * 0.25, (gap * 1.15) / ENGINE_RATIO), 44, 130);
  const sign = clamp(Math.min(gap * 0.66, height * 0.13), 26, 56);
  const signY = railY + sign * 0.95;
  const driveY = bottom - 78;
  const countSize = clamp(engine * 0.5, 34, 52);

  const x = useSharedValue(stopX(track.position));
  useEffect(() => {
    const to = stopX(track.position);
    x.value = calm ? withTiming(to, { duration: 1 }) : withSpring(to, { damping: 16, stiffness: 140 });
  }, [track.position, width]);
  const engineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - (engine * ENGINE_RATIO) / 2 }],
  }));

  const drive = (delta: 1 | -1) => {
    if (phase !== 'play') return;
    const next = step(track, delta);
    if (next === track) {
      stats.idleMoves++;
      return;
    }
    if (delta === -1 && stats.commits === 0) stats.changesBeforeCommit++;
    stats.moves++;
    setTrack(next);
    if (supports) speak(numberWord(next.position));
  };

  const finish = () => {
    onFinish({
      at: Date.now(),
      session,
      skill: 'drive-to',
      quantity: task.target,
      theme: `line-${task.last}`,
      arrangement: task.start === 0 ? 'from-start' : 'from-end',
      support: task.support,
      firstGiven: stats.firstGiven,
      firstCorrect: stats.firstCorrect,
      commits: stats.commits,
      help: helpShown ? 'shown' : 'none',
      changesBeforeCommit: stats.changesBeforeCommit,
      idleDrags: stats.idleMoves,
      replays: stats.replays,
    });
  };

  const commit = () => {
    if (phase !== 'play') return;
    const result = evaluateDrive(task, track);
    stats.commits++;
    if (stats.commits === 1) {
      stats.firstGiven = result.given;
      stats.firstCorrect = result.correct;
    }
    playSound(result.correct ? 'success' : 'retry', settings.sound);
    const line = trainFeedback(task, result.correct, result.given, progress.position + task.target);
    later(result.correct ? 500 : 350, () => speak(line));
    setRevealed(true);

    if (!result.correct) {
      if (stats.commits >= 2) setHelpShown(true);
      setPhase('feedback');
      later(1200, () => setPhase('play'));
      return;
    }
    setPhase('celebrate');
    later(3800, finish);
  };

  const replay = () => {
    stats.replays++;
    speak(trainPrompt(task));
  };

  const atWrongStop = revealed && phase !== 'celebrate' && track.position !== task.target;

  return (
    <Animated.View entering={calm ? undefined : FadeIn.duration(280)} style={styles.fill}>
      <World theme="train" width={width} height={height} reducedMotion={calm} />

      <View style={[styles.sleepers, { left: firstStop - 46, width: right - firstStop + 48, top: railY - 3 }]} />
      <View style={[styles.rail, { left: firstStop - 46, width: right - firstStop + 48, top: railY - 8 }]} />

      {Array.from({ length: task.last + 1 }, (_, index) => {
        const isTarget = revealed && index === task.target;
        const isHere = atWrongStop && index === track.position;
        return (
          <View key={index} style={[styles.untouchable, { position: 'absolute', left: stopX(index) - sign / 2, top: railY }]}>
            <View style={[styles.post, { left: sign / 2 - 3, height: signY - railY }]} />
            <View
              style={[
                styles.sign,
                { top: signY - railY - sign / 2, width: sign, height: sign, borderRadius: sign / 2 },
                isTarget && styles.signTarget,
                isHere && styles.signHere,
              ]}
            >
              {showNumbers && (
                <Text style={[styles.signText, { fontSize: sign * 0.6, lineHeight: sign * 0.82 }]}>{index}</Text>
              )}
            </View>
          </View>
        );
      })}

      <Animated.View style={[styles.untouchable, { position: 'absolute', left: 0, top: railY - engine * 0.93 }, engineStyle]}>
        <Engine height={engine} happy={phase === 'celebrate'} />
        {/* The number of the stop the train is at, shown whenever it is said aloud. */}
        {supports && (
          <NumberPop
            key={track.position}
            value={track.position}
            size={countSize}
            burst={2}
            pop={stats.moves > 0}
            reducedMotion={calm}
            style={{ left: (engine * ENGINE_RATIO) / 2 - countSize / 2, top: -countSize * 0.95 }}
          />
        )}
      </Animated.View>

      <View style={[styles.drive, { left, top: driveY }]}>
        <ChunkyButton size={58} color="#fff" shade="#CFC7DE" label="Back one stop" onPress={() => drive(-1)} disabled={phase !== 'play'}>
          <ArrowIcon size={34} back />
        </ChunkyButton>
        <ChunkyButton size={72} color={CORAL} shade="#C9492B" label="Forward one stop" onPress={() => drive(1)} disabled={phase !== 'play'}>
          <ArrowIcon size={44} />
        </ChunkyButton>
      </View>

      {phase === 'celebrate' && !calm && (
        <Confetti x={stopX(task.target)} y={railY - engine * 0.5} spread={height * 0.5} />
      )}

      <Hud
        left={left}
        top={insets.top + 6}
        bottom={height - (insets.top + 12 + 38)}
        captionLeft={left + 216}
        captionWidth={width * 0.4}
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
  fill: { flex: 1, backgroundColor: '#EAF4FF' },
  untouchable: { pointerEvents: 'none' },
  rail: { position: 'absolute', height: 7, borderRadius: 4, backgroundColor: '#6B5E52' },
  sleepers: {
    position: 'absolute',
    height: 10,
    borderTopWidth: 10,
    borderStyle: 'dashed',
    borderColor: '#A8907A',
  },
  post: { position: 'absolute', top: 0, width: 6, borderRadius: 3, backgroundColor: '#8A7968' },
  sign: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: INK,
    backgroundColor: CREAM,
  },
  signTarget: { backgroundColor: SUN, borderWidth: 4 },
  signHere: { borderColor: CORAL, borderStyle: 'dashed', borderWidth: 4 },
  signText: { fontFamily: FONT.bold, color: INK, textAlign: 'center' },
  drive: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
});
