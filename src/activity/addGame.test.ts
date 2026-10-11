import type { Attempt } from '../record/learningRecord';
import { ADD_SESSION_LENGTH, addsToTen, nextAddTask } from './addGame';

function tried(sum: number, support: 'supported' | 'independent', correct = true, pair = `1+${sum - 1}`): Attempt {
  return {
    at: 0,
    session: 2,
    skill: 'add',
    quantity: sum,
    theme: 'dino',
    arrangement: pair,
    support,
    firstGiven: correct ? sum : sum + 1,
    firstCorrect: correct,
    commits: 1,
    help: 'none',
    changesBeforeCommit: 0,
    idleDrags: 0,
    replays: 0,
  };
}

describe('adding game', () => {
  it('starts with two real groups that make no more than five', () => {
    for (let session = 1; session <= 6; session++) {
      for (let position = 0; position < ADD_SESSION_LENGTH; position++) {
        const task = nextAddTask([], session, position, 'train');
        expect(task.first).toBeGreaterThanOrEqual(1);
        expect(task.more).toBeGreaterThanOrEqual(1);
        expect(task.first + task.more).toBeLessThanOrEqual(5);
        expect(task).toMatchObject({ support: 'supported', top: 6, world: 'train' });
      }
    }
  });

  it('hides the second group once that sum has been found', () => {
    const attempts = [2, 3, 4, 5].map((sum) => tried(sum, 'supported'));
    expect(nextAddTask(attempts, 3, 0, 'dino').support).toBe('independent');
  });

  it('opens sums to ten after three sums within five are found without help', () => {
    expect(addsToTen([tried(2, 'independent'), tried(3, 'independent')])).toBe(false);
    const attempts = [2, 3, 4].map((sum) => tried(sum, 'independent'));
    expect(addsToTen(attempts)).toBe(true);
    const sums = Array.from({ length: 12 }, (_, p) => nextAddTask(attempts, 5, p, 'dragon'));
    expect(sums.some((task) => task.first + task.more > 5)).toBe(true);
    expect(sums.every((task) => task.first + task.more <= 10 && task.top === 10)).toBe(true);
  });

  it('shows everything again for the same sum after a miss with the group hidden', () => {
    const attempts = [tried(4, 'supported'), tried(4, 'independent', false, '3+1')];
    expect(nextAddTask(attempts, 2, 3, 'dino')).toMatchObject({ first: 3, more: 1, support: 'supported' });
  });
});
