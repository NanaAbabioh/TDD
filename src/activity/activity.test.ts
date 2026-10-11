import { CONTAINER, moveItem, receiver } from '../model/collection';
import { Attempt, highestUnlocked, stateOf } from '../record/learningRecord';
import { nextTask, sessionLength } from './sequencer';
import { Support, Theme, evaluate, makeSetTask, matchTask, startCollection } from './tasks';

const DAY = 24 * 60 * 60 * 1000;

function attempt(overrides: Partial<Attempt>): Attempt {
  return {
    at: 0,
    session: 1,
    skill: 'make-set',
    quantity: 3,
    theme: 'leaves',
    arrangement: 'line',
    support: 'independent',
    firstGiven: 3,
    firstCorrect: true,
    commits: 1,
    help: 'none',
    changesBeforeCommit: 0,
    idleDrags: 0,
    replays: 0,
    ...overrides,
  };
}

describe('evaluate', () => {
  it('always offers more than the task asks for', () => {
    const task = makeSetTask(3, 'independent', 'leaves', 'line');
    expect(task.supplyCount).toBeGreaterThan(task.quantity);
  });

  it('judges a made set by how many are in the container', () => {
    const task = makeSetTask(3, 'independent', 'leaves', 'line');
    let c = startCollection(task);
    for (const id of [0, 1]) c = moveItem(c, id, CONTAINER);
    expect(evaluate(task, c)).toEqual({ correct: false, given: 2, leftover: 0, short: 1 });
    c = moveItem(c, 2, CONTAINER);
    expect(evaluate(task, c).correct).toBe(true);
    c = moveItem(c, 3, CONTAINER);
    expect(evaluate(task, c)).toEqual({ correct: false, given: 4, leftover: 1, short: 0 });
  });

  it('judges matching by every receiver having one', () => {
    const task = matchTask(2);
    let c = moveItem(startCollection(task), 0, receiver(0));
    expect(evaluate(task, c)).toMatchObject({ correct: false, short: 1 });
    c = moveItem(c, 1, receiver(1));
    expect(evaluate(task, c).correct).toBe(true);
  });
});

describe('learning record', () => {
  it('separates supported success from independent success', () => {
    expect(stateOf([], 3)).toBe('not-tried');
    expect(stateOf([attempt({ firstCorrect: false })], 3)).toBe('exploring');
    expect(stateOf([attempt({ support: 'supported' })], 3)).toBe('supported');
  });

  it('needs varied independent successes across sessions before calling it independent', () => {
    const sameThing = [1, 2, 3].map(() => attempt({}));
    expect(stateOf(sameThing, 3)).toBe('supported');

    const varied = [
      attempt({ session: 1 }),
      attempt({ session: 1, theme: 'cups', arrangement: 'scattered' }),
      attempt({ session: 2 }),
    ];
    expect(stateOf(varied, 3)).toBe('independent');
    expect(stateOf([...varied, attempt({ session: 3, at: DAY * 2 })], 3)).toBe('retained');
  });

  it('unlocks the next quantity after one independent success', () => {
    expect(highestUnlocked([])).toBe(3);
    expect(highestUnlocked([attempt({ quantity: 3 })])).toBe(4);
    expect(highestUnlocked([attempt({ quantity: 3 }), attempt({ quantity: 4 })])).toBe(5);
  });
});

describe('sequencer', () => {
  it('opens the first session with free play, then stays within 1 to 3', () => {
    expect(nextTask([], 1, 0).skill).toBe('explore');
    for (let position = 1; position < sessionLength(1); position++) {
      const task = nextTask([], 1, position);
      expect(task.quantity).toBeGreaterThanOrEqual(1);
      expect(task.quantity).toBeLessThanOrEqual(3);
      expect(task.support).toBe('supported');
      expect(task.theme).toBe('leaves');
    }
  });

  it('removes the supports once a quantity has been made correctly', () => {
    const attempts = [1, 2, 3].map((quantity) => attempt({ quantity, support: 'supported' }));
    for (let position = 0; position < sessionLength(2); position++) {
      expect(nextTask(attempts, 2, position).support).toBe('independent');
    }
  });

  it('brings the supports back for the same request after an independent miss', () => {
    const miss = attempt({ session: 2, quantity: 2, theme: 'cups', firstCorrect: false, firstGiven: 3 });
    const task = nextTask([attempt({ quantity: 2, support: 'supported' }), miss], 2, 3);
    expect(task).toMatchObject({ skill: 'make-set', quantity: 2, theme: 'cups', support: 'supported' });
  });

  it('only moves a quantity to the train after it was made independently', () => {
    const themes = (support: Support): Theme[] => {
      const attempts = [1, 2, 3].map((quantity) => attempt({ quantity, support }));
      return Array.from({ length: sessionLength(2) }, (_, p) => nextTask(attempts, 2, p).theme);
    };
    expect(themes('supported')).not.toContain('train');
    expect(themes('independent')).toContain('train');
  });
});
