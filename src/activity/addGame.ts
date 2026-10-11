// Adding Up: two groups come together and the child says how many there are
// in all. Sums stay within 5 at first, then within 10.

import { Attempt, hasFirstCorrect, independentSuccesses } from '../record/learningRecord';
import type { Support } from './tasks';

export type AddWorld = 'dino' | 'train' | 'dragon';

export type AddTask = {
  skill: 'add';
  first: number;
  more: number;
  support: Support;
  world: AddWorld;
  // The highest number on the answer strip.
  top: number;
};

export const ADD_SESSION_LENGTH = 5;

const SKILL = 'add';

function pairs(lowest: number, highest: number): [number, number][] {
  const found: [number, number][] = [];
  for (let first = 1; first < highest; first++) {
    for (let more = 1; first + more <= highest; more++) {
      if (first + more >= lowest) found.push([first, more]);
    }
  }
  return found;
}

const WITHIN_FIVE = pairs(2, 5);
const SIX_TO_TEN = pairs(6, 10);

// Sums up to ten open once three different sums within five were found without help.
export function addsToTen(attempts: readonly Attempt[]): boolean {
  const secure = [2, 3, 4, 5].filter((sum) => independentSuccesses(attempts, sum, SKILL).length > 0);
  return secure.length >= 3;
}

export function nextAddTask(
  attempts: readonly Attempt[],
  session: number,
  position: number,
  world: AddWorld,
): AddTask {
  const big = addsToTen(attempts);
  const top = big ? 10 : 6;
  const previous = attempts[attempts.length - 1];
  const sameSession = previous?.session === session && previous.skill === SKILL;

  // After a miss with the second group hidden, show everything for the same sum.
  if (sameSession && previous.support === 'independent' && !previous.firstCorrect) {
    const [first, more] = previous.arrangement.split('+').map(Number);
    return { skill: SKILL, first, more, support: 'supported', world, top };
  }

  // Once the bigger sums are open, a small one still comes back now and then.
  const pool = big ? [...SIX_TO_TEN, ...WITHIN_FIVE.slice(0, 6)] : WITHIN_FIVE;
  let index = (position * 7 + session * 3) % pool.length;
  if (sameSession && previous.quantity === pool[index][0] + pool[index][1]) {
    index = (index + 1) % pool.length;
  }
  const [first, more] = pool[index];
  const support = hasFirstCorrect(attempts, first + more, SKILL) ? 'independent' : 'supported';
  return { skill: SKILL, first, more, support, world, top };
}
