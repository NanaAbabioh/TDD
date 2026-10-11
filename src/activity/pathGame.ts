// Number Path: lay a path from 0 to the last number by finding, each time,
// the neighbouring tile that comes next.

import { Maze, generateMaze } from '../model/maze';
import { Attempt, hasFirstCorrect, independentSuccesses } from '../record/learningRecord';
import type { Support } from './tasks';

export type Traveller = 'train' | 'dragon';

export type PathTask = {
  skill: 'path';
  // The number the path ends on.
  last: number;
  cols: number;
  rows: number;
  support: Support;
  traveller: Traveller;
  seed: number;
};

export const PATH_SESSION_LENGTH = 3;

const SKILL = 'path';

// Each level is a longer count on a bigger grid, with room left for wrong turns.
export const PATH_LEVELS = [
  { last: 5, cols: 4, rows: 3 },
  { last: 10, cols: 6, rows: 3 },
  { last: 20, cols: 8, rows: 4 },
  { last: 30, cols: 9, rows: 5 },
  { last: 50, cols: 11, rows: 6 },
];

export function buildMaze(task: PathTask): Maze {
  // Without help, the tiles beside the path hold close numbers that are easy to confuse.
  return generateMaze(task.cols, task.rows, task.last, task.seed, task.support === 'independent');
}

// A path counts as found when almost every step was right at the first tap.
export function missesAllowed(last: number): number {
  return Math.max(1, Math.floor(last / 10));
}

// The level being worked on: the first one not yet done without help.
export function pathLevel(attempts: readonly Attempt[]) {
  return (
    PATH_LEVELS.find((level) => independentSuccesses(attempts, level.last, SKILL).length === 0) ??
    PATH_LEVELS[PATH_LEVELS.length - 1]
  );
}

export function nextPathTask(attempts: readonly Attempt[], session: number, position: number): PathTask {
  const level = pathLevel(attempts);
  const support = hasFirstCorrect(attempts, level.last, SKILL) ? 'independent' : 'supported';
  return {
    skill: SKILL,
    ...level,
    support,
    traveller: (session + position) % 2 === 0 ? 'train' : 'dragon',
    seed: session * 7919 + position * 104729 + level.last,
  };
}
