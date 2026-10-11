// Activity rules: what a task asks for and how a committed answer is judged.
// Nothing here knows about dinosaurs, trains or the screen.

import { Collection, countIn, createCollection, firstEmptyReceiver } from '../model/collection';

export type Skill = 'explore' | 'match' | 'make-set';
// supported: spaces to fill, receivers in view and counting aloud.
// independent: none of those until the child has committed an answer.
export type Support = 'supported' | 'independent';
export type Theme = 'leaves' | 'cups' | 'train';
export type Arrangement = 'line' | 'scattered';

export type Task = {
  skill: Skill;
  quantity: number;
  support: Support;
  theme: Theme;
  arrangement: Arrangement;
  supplyCount: number;
};

export type Result = {
  correct: boolean;
  given: number;
  leftover: number;
  short: number;
};

export function exploreTask(): Task {
  return {
    skill: 'explore',
    quantity: 0,
    support: 'supported',
    theme: 'leaves',
    arrangement: 'scattered',
    supplyCount: 5,
  };
}

export function matchTask(quantity: number): Task {
  return {
    skill: 'match',
    quantity,
    support: 'supported',
    theme: 'leaves',
    arrangement: 'line',
    supplyCount: quantity + 2,
  };
}

export function makeSetTask(
  quantity: number,
  support: Support,
  theme: Theme,
  arrangement: Arrangement,
): Task {
  // Always more than is asked for, so the child has to decide when to stop.
  return { skill: 'make-set', quantity, support, theme, arrangement, supplyCount: quantity + 3 };
}

export function startCollection(task: Task): Collection {
  return createCollection(task.supplyCount, task.quantity);
}

export function evaluate(task: Task, c: Collection): Result {
  if (task.skill === 'explore') {
    return { correct: true, given: countIn(c, 'container'), leftover: 0, short: 0 };
  }
  if (task.skill === 'match') {
    const given = countIn(c, 'receiver');
    const short = task.quantity - given;
    return { correct: firstEmptyReceiver(c) === undefined, given, leftover: 0, short };
  }
  const given = countIn(c, 'container');
  return {
    correct: given === task.quantity,
    given,
    leftover: Math.max(0, given - task.quantity),
    short: Math.max(0, task.quantity - given),
  };
}
