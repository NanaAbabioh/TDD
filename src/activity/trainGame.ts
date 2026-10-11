// Train Stops: drive the train to a numbered stop on a track.
// The stops are a number line; each move is one count.

import { Track, createTrack } from '../model/track';
import { Attempt, hasFirstCorrect, independentSuccesses } from '../record/learningRecord';
import type { Support } from './tasks';

export type TrainTask = {
  skill: 'drive-to';
  target: number;
  support: Support;
  // The number of the last stop on the line.
  last: number;
  start: number;
};

export const TRAIN_SESSION_LENGTH = 5;

const SKILL = 'drive-to';

export function startTrack(task: TrainTask): Track {
  return createTrack(task.last, task.start);
}

export function evaluateDrive(task: TrainTask, track: Track) {
  return {
    correct: track.position === task.target,
    given: track.position,
    off: track.position - task.target,
  };
}

// The line grows from five stops to ten once three of the first five have
// been reached without help.
export function lineLength(attempts: readonly Attempt[]): number {
  const secure = [1, 2, 3, 4, 5].filter((q) => independentSuccesses(attempts, q, SKILL).length > 0);
  return secure.length >= 3 ? 10 : 5;
}

export function nextTrainTask(
  attempts: readonly Attempt[],
  session: number,
  position: number,
): TrainTask {
  const last = lineLength(attempts);
  const previous = attempts[attempts.length - 1];
  const sameSession = previous?.session === session && previous.skill === SKILL;

  // After a miss without help, bring the numbers and counting back for the same stop.
  if (sameSession && previous.support === 'independent' && !previous.firstCorrect) {
    return { skill: SKILL, target: previous.quantity, support: 'supported', last, start: 0 };
  }

  const all = Array.from({ length: last }, (_, i) => i + 1);
  const needsWork = all.filter((q) => independentSuccesses(attempts, q, SKILL).length === 0);
  const pool = needsWork.length > 0 ? [...needsWork, ...needsWork, ...all] : all;
  // A stride of three spreads the targets out, so they do not simply go up by one.
  let target = pool[(position * 3 + session) % pool.length];
  if (sameSession && previous.quantity === target) {
    target = pool[(position * 3 + session + 1) % pool.length];
  }

  const support = hasFirstCorrect(attempts, target, SKILL) ? 'independent' : 'supported';
  // Now and then the train starts at the far end and has to come back.
  const fromEnd = support === 'independent' && position % 3 === 2 && target < last;
  return { skill: SKILL, target, support, last, start: fromEnd ? last : 0 };
}
