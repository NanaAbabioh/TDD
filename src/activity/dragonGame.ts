// Dragon Hoard: give the dragon a number of coins using a ten-space tray.
// Six to ten are built on the tray; teen numbers are one full chest and some more.

import { Hoard, createHoard, hoardTotal } from '../model/hoard';
import { Attempt, hasFirstCorrect, independentSuccesses } from '../record/learningRecord';
import type { Support } from './tasks';

export type Treasure = 'coins' | 'gems';

export type DragonTask = {
  skill: 'hoard';
  target: number;
  support: Support;
  treasure: Treasure;
};

export const DRAGON_SESSION_LENGTH = 5;

const SKILL = 'hoard';
const SUPPLY = 24;

export function startHoard(): Hoard {
  return createHoard(SUPPLY);
}

export function evaluateHoard(task: DragonTask, hoard: Hoard) {
  const given = hoardTotal(hoard);
  return { correct: given === task.target, given, off: given - task.target };
}

// Starts with five to ten. Teen numbers open once three of those have been
// made without help.
export function hoardRange(attempts: readonly Attempt[]): number[] {
  const firstTen = [5, 6, 7, 8, 9, 10];
  const secure = firstTen.filter((q) => independentSuccesses(attempts, q, SKILL).length > 0);
  if (secure.length < 3) return firstTen;
  return [...firstTen, 11, 12, 13, 14, 15, 16, 17, 18, 19];
}

export function nextDragonTask(
  attempts: readonly Attempt[],
  session: number,
  position: number,
): DragonTask {
  const previous = attempts[attempts.length - 1];
  const sameSession = previous?.session === session && previous.skill === SKILL;
  const treasure: Treasure = position % 2 === 1 ? 'gems' : 'coins';

  // After a miss without help, bring the counting and numerals back for the same number.
  if (sameSession && previous.support === 'independent' && !previous.firstCorrect) {
    return {
      skill: SKILL,
      target: previous.quantity,
      support: 'supported',
      treasure: previous.theme as Treasure,
    };
  }

  const all = hoardRange(attempts);
  const needsWork = all.filter((q) => independentSuccesses(attempts, q, SKILL).length === 0);
  const pool = needsWork.length > 0 ? [...needsWork, ...needsWork, ...all] : all;
  let target = pool[(position * 3 + session) % pool.length];
  if (sameSession && previous.quantity === target) {
    target = pool[(position * 3 + session + 1) % pool.length];
  }

  const support = hasFirstCorrect(attempts, target, SKILL) ? 'independent' : 'supported';
  return { skill: SKILL, target, support, treasure };
}
