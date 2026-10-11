// Every spoken prompt, kept short and reusable. Each line is also shown as a
// caption, and can later be swapped for a recording without touching the game.

import type { DragonTask } from '../activity/dragonGame';
import type { Result, Task, Theme } from '../activity/tasks';
import type { TrainTask } from '../activity/trainGame';

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty',
];

export function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}

const NOUNS: Record<Theme, { one: string; many: string; where: string; who: string; whos: string }> = {
  leaves: { one: 'leaf', many: 'leaves', where: 'in the basket', who: 'dinosaur', whos: 'dinosaurs' },
  cups: { one: 'cup', many: 'cups', where: 'on the tray', who: 'dinosaur', whos: 'dinosaurs' },
  train: { one: 'rider', many: 'riders', where: 'on the train', who: 'seat', whos: 'seats' },
};

function amount(n: number, theme: Theme): string {
  const noun = NOUNS[theme];
  return `${numberWord(n)} ${n === 1 ? noun.one : noun.many}`;
}

export function sentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function promptLine(task: Task): string {
  if (task.skill === 'explore') return 'Move the leaves. Ring the bell when you are done.';
  if (task.skill === 'match') return 'Give each dinosaur one leaf.';
  return `Put ${amount(task.quantity, task.theme)} ${NOUNS[task.theme].where}.`;
}

// Praise names the achievement, not the child's ability, and varies a little.
export const PRAISE = ['You did it!', 'Well done!', 'That is it!', 'You got it!'];

// What the pairing shows, said plainly.
function revealLine(task: Task, result: Result): string {
  const noun = NOUNS[task.theme];
  if (result.correct) {
    if (task.skill === 'match') return 'One leaf each!';
    const total = sentence(amount(task.quantity, task.theme));
    return task.theme === 'train' ? `${total}. Every seat is full!` : `${total}. One each!`;
  }
  if (result.leftover > 0) {
    return result.leftover === 1
      ? 'One is left over.'
      : sentence(`${numberWord(result.leftover)} are left over.`);
  }
  if (task.theme === 'train') {
    return result.short === 1
      ? 'One seat is empty.'
      : sentence(`${numberWord(result.short)} seats are empty.`);
  }
  return result.short === 1
    ? `One ${noun.who} has no ${noun.one}.`
    : sentence(`${numberWord(result.short)} ${noun.whos} have no ${noun.one}.`);
}

// A right answer gets the reveal and then praise. A miss gets a gentle
// "not quite", the reveal that shows why, and an invitation to try again.
export function feedbackLine(task: Task, result: Result, turn = 0): string {
  const reveal = revealLine(task, result);
  if (result.correct) return `${reveal} ${PRAISE[turn % PRAISE.length]}`;
  return `Not quite. ${reveal} Try again.`;
}

export function stillLine(task: Task): string {
  return `Still ${amount(task.quantity, task.theme)}.`;
}

export function trainPrompt(task: TrainTask): string {
  return `Drive the train to stop ${numberWord(task.target)}.`;
}

export function trainFeedback(task: TrainTask, correct: boolean, given: number, turn = 0): string {
  if (correct) return `Stop ${numberWord(task.target)}! ${PRAISE[turn % PRAISE.length]}`;
  return `Not quite. This is stop ${numberWord(given)}. Try again.`;
}

export function dragonPrompt(task: DragonTask): string {
  return `Give the dragon ${numberWord(task.target)} ${task.treasure}.`;
}

export function dragonFeedback(task: DragonTask, correct: boolean, given: number, turn = 0): string {
  if (!correct) return `Not quite. That is ${numberWord(given)}. Try again.`;
  const praise = PRAISE[turn % PRAISE.length];
  const word = sentence(numberWord(task.target));
  // A teen number is said as its ten and its ones first.
  if (task.target > 10) return `Ten and ${numberWord(task.target - 10)}. ${word}! ${praise}`;
  return `${word} ${task.treasure}! ${praise}`;
}

export const DONE_LINES = {
  dino: 'The picnic is ready. See you next time!',
  train: 'All aboard! See you next time!',
  dragon: 'The dragon is happy. See you next time!',
};
