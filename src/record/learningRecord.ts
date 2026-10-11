// The learning record: what the child attempted and how independently.
// The thresholds below are product hypotheses to calibrate with children,
// not validated developmental measures.

import type { Support } from '../activity/tasks';

// match and make-set belong to the picnic, drive-to to the train, hoard to the dragon.
export type AttemptSkill = 'match' | 'make-set' | 'drive-to' | 'hoard';

export type Attempt = {
  at: number;
  session: number;
  skill: AttemptSkill;
  quantity: number;
  // What the task looked like. Two attempts with a different theme or
  // arrangement count as varied examples.
  theme: string;
  arrangement: string;
  support: Support;
  // The first answer the child committed, before any feedback.
  firstGiven: number;
  firstCorrect: boolean;
  commits: number;
  // 'shown' when the game added spaces and counting after repeated misses.
  help: 'none' | 'shown';
  // Items taken back out before the first commit: the child inspecting and repairing.
  changesBeforeCommit: number;
  // Drags that ended without moving anything: a sign of input trouble, not of math trouble.
  idleDrags: number;
  replays: number;
};

export type SkillState = 'not-tried' | 'exploring' | 'supported' | 'independent' | 'retained';

export const QUANTITIES = [1, 2, 3, 4, 5];

const INDEPENDENT_SUCCESSES_NEEDED = 3;

function dayOf(at: number): string {
  const d = new Date(at);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function makeSetAttempts(
  attempts: readonly Attempt[],
  quantity: number,
  skill: AttemptSkill = 'make-set',
): Attempt[] {
  return attempts.filter((a) => a.skill === skill && a.quantity === quantity);
}

export function independentSuccesses(
  attempts: readonly Attempt[],
  quantity: number,
  skill: AttemptSkill = 'make-set',
): Attempt[] {
  return makeSetAttempts(attempts, quantity, skill).filter(
    (a) => a.support === 'independent' && a.firstCorrect,
  );
}

export function hasFirstCorrect(
  attempts: readonly Attempt[],
  quantity: number,
  skill: AttemptSkill = 'make-set',
): boolean {
  return makeSetAttempts(attempts, quantity, skill).some((a) => a.firstCorrect);
}

export function stateOf(
  attempts: readonly Attempt[],
  quantity: number,
  skill: AttemptSkill = 'make-set',
): SkillState {
  const tried = makeSetAttempts(attempts, quantity, skill);
  if (tried.length === 0) return 'not-tried';

  const wins = independentSuccesses(attempts, quantity, skill);
  const variations = new Set(wins.map((a) => `${a.theme}/${a.arrangement}`));
  const sessions = new Set(wins.map((a) => a.session));
  const days = new Set(wins.map((a) => dayOf(a.at)));
  const independent =
    wins.length >= INDEPENDENT_SUCCESSES_NEEDED && variations.size >= 2 && sessions.size >= 2;

  if (independent && days.size >= 2) return 'retained';
  if (independent) return 'independent';
  if (tried.some((a) => a.firstCorrect)) return 'supported';
  return 'exploring';
}

// The highest quantity on offer. A child moves on provisionally after one
// independent success; the earlier quantity keeps coming back to check it holds.
export function highestUnlocked(attempts: readonly Attempt[]): number {
  let max = 3;
  while (max < 5 && independentSuccesses(attempts, max).length > 0) max++;
  return max;
}

export function themesUsed(attempts: readonly Attempt[], quantity: number): string[] {
  return [...new Set(independentSuccesses(attempts, quantity).map((a) => a.theme))];
}

// The lowest quantity on offer that is not yet secure, for the parent tip.
export function focusQuantity(attempts: readonly Attempt[]): number {
  const max = highestUnlocked(attempts);
  for (let q = 1; q <= max; q++) {
    const state = stateOf(attempts, q);
    if (state !== 'independent' && state !== 'retained') return q;
  }
  return max;
}
