// One short session: a handful of tasks, then a clear place to stop.

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { DRAGON_SESSION_LENGTH, DragonTask, nextDragonTask } from '../activity/dragonGame';
import { PATH_SESSION_LENGTH, PathTask, nextPathTask } from '../activity/pathGame';
import { nextTask, sessionLength } from '../activity/sequencer';
import type { Task } from '../activity/tasks';
import { TRAIN_SESSION_LENGTH, TrainTask, nextTrainTask } from '../activity/trainGame';
import type { Attempt } from '../record/learningRecord';
import type { SaveData } from '../record/storage';
import { DONE_LINES } from '../voice/lines';
import { playSound } from '../voice/sounds';
import { say } from '../voice/speak';
import { HomeIcon } from './art';
import { ChunkyButton } from './ChunkyButton';
import { Confetti } from './Confetti';
import { DinoActor } from './DinoActor';
import { DragonScene } from './DragonScene';
import { PathScene } from './PathScene';
import { Scene } from './Scene';
import { FONT, INK } from './theme';
import { TrainScene } from './TrainScene';
import { World } from './World';

export type Game = 'dino' | 'train' | 'dragon' | 'path';

type AnyTask = Task | TrainTask | DragonTask | PathTask;

type Props = {
  game: Game;
  save: SaveData;
  onAttempt: (attempt: Attempt) => void;
  onExit: () => void;
};

function taskFor(game: Game, attempts: readonly Attempt[], session: number, position: number): AnyTask {
  if (game === 'train') return nextTrainTask(attempts, session, position);
  if (game === 'dragon') return nextDragonTask(attempts, session, position);
  if (game === 'path') return nextPathTask(attempts, session, position);
  return nextTask(attempts, session, position);
}

export function PlayScreen({ game, save, onAttempt, onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const calm = save.settings.reducedMotion;
  const session = useRef(save.sessions + 1).current;
  const length =
    game === 'train'
      ? TRAIN_SESSION_LENGTH
      : game === 'dragon'
        ? DRAGON_SESSION_LENGTH
        : game === 'path'
          ? PATH_SESSION_LENGTH
          : sessionLength(session);
  const [step, setStep] = useState(() => ({
    position: 0,
    task: taskFor(game, save.attempts, session, 0),
  }));
  const done = step.position >= length;

  useEffect(() => {
    if (!done) return;
    playSound('fanfare');
    say(DONE_LINES[game], save.settings.voice);
  }, [done]);

  const advance = (attempt?: Attempt) => {
    const attempts = attempt ? [...save.attempts, attempt] : save.attempts;
    if (attempt) onAttempt(attempt);
    const position = step.position + 1;
    setStep({ position, task: taskFor(game, attempts, session, position) });
  };

  if (done) {
    const dino = Math.min(height * 0.36, width * 0.2);
    return (
      <View style={styles.done}>
        <World
          theme={game === 'dragon' ? 'dragon' : game === 'dino' ? 'cups' : 'train'}
          width={width}
          height={height}
          reducedMotion={calm}
          lush
        />
        <View style={styles.row}>
          {[0, 1, 2].map((variant) => (
            <DinoActor
              key={variant}
              size={dino}
              variant={variant}
              mood="happy"
              reducedMotion={calm}
              dragon={(game === 'dragon' || game === 'path') && variant === 1}
            />
          ))}
        </View>
        <Text style={styles.caption}>{DONE_LINES[game]}</Text>
        <ChunkyButton size={84} color="#fff" shade="#CFC7DE" label="Home" onPress={onExit}>
          <HomeIcon size={44} />
        </ChunkyButton>
        {!calm && <Confetti x={width / 2} y={height * 0.3} spread={height * 0.7} />}
      </View>
    );
  }

  const shared = {
    session,
    settings: save.settings,
    progress: { position: step.position, length },
    onFinish: advance,
    onExit,
  };
  if (game === 'train') {
    return <TrainScene key={step.position} task={step.task as TrainTask} {...shared} />;
  }
  if (game === 'dragon') {
    return <DragonScene key={step.position} task={step.task as DragonTask} {...shared} />;
  }
  if (game === 'path') {
    return <PathScene key={step.position} task={step.task as PathTask} {...shared} />;
  }
  return <Scene key={step.position} task={step.task as Task} {...shared} />;
}

const styles = StyleSheet.create({
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFF3D6' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  caption: {
    fontFamily: FONT.semi,
    fontSize: 20,
    color: INK,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});
