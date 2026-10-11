// Chooses the next task from what the child has shown so far.
// One thing changes at a time: quantity, arrangement, objects, then setting.

import {
  Attempt,
  hasFirstCorrect,
  highestUnlocked,
  independentSuccesses,
  stateOf,
} from '../record/learningRecord';
import { Arrangement, Task, Theme, exploreTask, makeSetTask, matchTask } from './tasks';

type Slot = { skill: 'match' | 'make-set'; theme: Theme; arrangement: Arrangement };

const SLOTS: Slot[] = [
  { skill: 'match', theme: 'leaves', arrangement: 'line' },
  { skill: 'make-set', theme: 'leaves', arrangement: 'line' },
  { skill: 'make-set', theme: 'leaves', arrangement: 'scattered' },
  { skill: 'make-set', theme: 'cups', arrangement: 'scattered' },
  { skill: 'make-set', theme: 'leaves', arrangement: 'line' },
  { skill: 'make-set', theme: 'train', arrangement: 'line' },
];

export function sessionLength(session: number): number {
  // The very first session opens with free play to learn the controls.
  return session === 1 ? SLOTS.length + 1 : SLOTS.length;
}

function quantityFor(attempts: readonly Attempt[], session: number, slot: number): number {
  const max = highestUnlocked(attempts);
  const all = Array.from({ length: max }, (_, i) => i + 1);
  const secure = all.filter((q) => ['independent', 'retained'].includes(stateOf(attempts, q)));
  const needsWork = all.filter((q) => !secure.includes(q));
  // Quantities that need work come up twice as often; secure ones return as retention checks.
  const pool = needsWork.length > 0 ? [...needsWork, ...needsWork, ...secure] : secure;
  return pool[(slot + session) % pool.length];
}

function ready(attempts: readonly Attempt[], quantity: number, theme: Theme): boolean {
  if (theme === 'cups') return hasFirstCorrect(attempts, quantity);
  if (theme === 'train') return independentSuccesses(attempts, quantity).length > 0;
  return true;
}

// New objects and the train are for carrying over something already shown with
// leaves, so those slots switch to a quantity that is ready for them.
function transferQuantity(
  attempts: readonly Attempt[],
  session: number,
  quantity: number,
  theme: Theme,
): number {
  if (ready(attempts, quantity, theme)) return quantity;
  const candidates = Array.from({ length: highestUnlocked(attempts) }, (_, i) => i + 1).filter(
    (q) => ready(attempts, q, theme),
  );
  return candidates.length > 0 ? candidates[session % candidates.length] : quantity;
}

export function nextTask(attempts: readonly Attempt[], session: number, position: number): Task {
  let slot = position;
  if (session === 1) {
    if (position === 0) return exploreTask();
    slot = position - 1;
  }

  // After a miss without supports, bring the supports back for the same request
  // before anything else changes.
  const last = attempts[attempts.length - 1];
  if (
    last &&
    last.session === session &&
    last.skill === 'make-set' &&
    last.support === 'independent' &&
    !last.firstCorrect
  ) {
    return makeSetTask(
      last.quantity,
      'supported',
      last.theme as Theme,
      last.arrangement as Arrangement,
    );
  }

  const template = SLOTS[slot % SLOTS.length];
  // Avoid asking for the same amount twice running, so the child has to listen each time.
  let planned = quantityFor(attempts, session, slot);
  if (last?.session === session && last.quantity === planned) {
    planned = quantityFor(attempts, session, slot + 1);
  }
  const quantity = transferQuantity(attempts, session, planned, template.theme);
  if (template.skill === 'match' && !hasFirstCorrect(attempts, quantity)) {
    return matchTask(quantity);
  }
  const support = hasFirstCorrect(attempts, quantity) ? 'independent' : 'supported';
  const theme = ready(attempts, quantity, template.theme) ? template.theme : 'leaves';
  return makeSetTask(quantity, support, theme, template.arrangement);
}
