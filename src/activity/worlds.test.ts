import { addCoin, pack } from '../model/hoard';
import { createTrack } from '../model/track';
import type { Attempt, AttemptSkill } from '../record/learningRecord';
import { evaluateHoard, hoardRange, nextDragonTask, startHoard } from './dragonGame';
import { evaluateDrive, lineLength, nextTrainTask } from './trainGame';

function win(skill: AttemptSkill, quantity: number, support: 'supported' | 'independent'): Attempt {
  return {
    at: 0,
    session: 1,
    skill,
    quantity,
    theme: 'x',
    arrangement: 'x',
    support,
    firstGiven: quantity,
    firstCorrect: true,
    commits: 1,
    help: 'none',
    changesBeforeCommit: 0,
    idleDrags: 0,
    replays: 0,
  };
}

describe('train game', () => {
  it('judges by the stop the train is standing at', () => {
    const task = nextTrainTask([], 1, 0);
    expect(evaluateDrive(task, createTrack(5, task.target)).correct).toBe(true);
    expect(evaluateDrive(task, createTrack(5, task.target === 5 ? 4 : task.target + 1))).toMatchObject({
      correct: false,
    });
  });

  it('starts supported on a five-stop line and never repeats a stop twice running', () => {
    let previous = 0;
    for (let position = 0; position < 5; position++) {
      const task = nextTrainTask([], 1, position);
      expect(task).toMatchObject({ support: 'supported', last: 5, start: 0 });
      expect(task.target).toBeGreaterThanOrEqual(1);
      expect(task.target).toBeLessThanOrEqual(5);
      if (position > 0) expect(task.target).not.toBe(previous);
      previous = task.target;
    }
  });

  it('extends the line to ten after three stops are reached without help', () => {
    expect(lineLength([win('drive-to', 1, 'independent'), win('drive-to', 2, 'independent')])).toBe(5);
    const three = [1, 2, 3].map((q) => win('drive-to', q, 'independent'));
    expect(lineLength(three)).toBe(10);
  });

  it('is not unlocked by picnic attempts', () => {
    const picnic = [1, 2, 3].map((q) => win('make-set', q, 'independent'));
    expect(lineLength(picnic)).toBe(5);
    expect(nextTrainTask(picnic, 2, 0).support).toBe('supported');
  });
});

describe('dragon game', () => {
  it('counts a chest as ten', () => {
    let hoard = startHoard();
    for (let i = 0; i < 10; i++) hoard = addCoin(hoard);
    hoard = addCoin(addCoin(pack(hoard)));
    const task = { skill: 'hoard' as const, target: 12, support: 'supported' as const, treasure: 'coins' as const };
    expect(evaluateHoard(task, hoard)).toEqual({ correct: true, given: 12, off: 0 });
  });

  it('keeps to five through ten until three are made without help', () => {
    expect(hoardRange([])).toEqual([5, 6, 7, 8, 9, 10]);
    const three = [5, 6, 7].map((q) => win('hoard', q, 'independent'));
    expect(hoardRange(three)).toContain(13);
    for (let position = 0; position < 5; position++) {
      const task = nextDragonTask([], 1, position);
      expect(task.target).toBeGreaterThanOrEqual(5);
      expect(task.target).toBeLessThanOrEqual(10);
      expect(task.support).toBe('supported');
    }
  });

  it('removes the help once a number has been made correctly', () => {
    const attempts = [5, 6, 7, 8, 9, 10].map((q) => win('hoard', q, 'supported'));
    expect(nextDragonTask(attempts, 2, 0).support).toBe('independent');
  });
});
