// Every spoken prompt, kept short and reusable. The speaker is a child talking
// to another child: playful, but the number words stay exact. Each line is also shown as a
// caption, and can later be swapped for a recording without touching the game.

import type { AddTask } from '../activity/addGame';
import type { DragonTask } from '../activity/dragonGame';
import type { PathTask } from '../activity/pathGame';
import type { Result, Task, Theme } from '../activity/tasks';
import type { TrainTask } from '../activity/trainGame';

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty',
];

const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function numberWord(n: number): string {
  if (WORDS[n]) return WORDS[n];
  if (n < 100) {
    const ones = n % 10;
    return ones === 0 ? TENS[n / 10] : `${TENS[Math.floor(n / 10)]} ${WORDS[ones]}`;
  }
  return String(n);
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
  if (task.skill === 'explore') return "Let's play! Move the leaves around. Ring the bell when you're done!";
  if (task.skill === 'match') return 'Can you give every dinosaur one leaf?';
  return `Can you put ${amount(task.quantity, task.theme)} ${NOUNS[task.theme].where}?`;
}

// Praise names the achievement, not the child's ability, and varies a little.
export const PRAISE = ['Yay, you did it!', 'Woohoo, well done!', "Wow, that's it!", 'Yes! You got it!'];
const RETRY = 'Oops, not quite!';

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
  return `${RETRY} ${reveal} Try again!`;
}

export function stillLine(task: Task): string {
  return `Look! Still ${amount(task.quantity, task.theme)}!`;
}

export function trainPrompt(task: TrainTask): string {
  return `Can you drive the train to stop ${numberWord(task.target)}?`;
}

export function trainFeedback(task: TrainTask, correct: boolean, given: number, turn = 0): string {
  if (correct) return `Stop ${numberWord(task.target)}! ${PRAISE[turn % PRAISE.length]}`;
  return `${RETRY} This is stop ${numberWord(given)}. Try again!`;
}

export function dragonPrompt(task: DragonTask): string {
  return `Can you give the dragon ${numberWord(task.target)} ${task.treasure}?`;
}

export function dragonFeedback(task: DragonTask, correct: boolean, given: number, turn = 0): string {
  if (!correct) return `${RETRY} That is ${numberWord(given)}. Try again!`;
  const praise = PRAISE[turn % PRAISE.length];
  const word = sentence(numberWord(task.target));
  // A teen number is said as its ten and its ones first.
  if (task.target > 10) return `Ten and ${numberWord(task.target - 10)}. ${word}! ${praise}`;
  return `${word} ${task.treasure}! ${praise}`;
}

const PLACES = { train: 'the station', dragon: 'the nest', dino: 'the picnic' };
const TRAVELLERS = { train: 'the train', dragon: 'the dragon', dino: 'the dinosaur' };

export const WORLD_NAMES = { train: 'Trains', dragon: 'Dragons', dino: 'Dinosaurs' };

export function pathPrompt(task: PathTask): string {
  return `Help ${TRAVELLERS[task.traveller]} get to ${PLACES[task.traveller]}! Start at zero. What comes next?`;
}

export function pathAsk(reached: number): string {
  return `Oops! What comes after ${numberWord(reached)}?`;
}

export function pathDone(task: PathTask, turn = 0): string {
  return `${sentence(numberWord(task.last))}! You made it to ${PLACES[task.traveller]}! ${PRAISE[turn % PRAISE.length]}`;
}

// The story of two groups coming together, told for each world.
export function addPrompt(task: AddTask): string {
  const first = numberWord(task.first);
  const more = numberWord(task.more);
  const one = task.first === 1;
  const oneMore = task.more === 1;
  if (task.world === 'train') {
    return `${sentence(first)} ${one ? 'rider is' : 'riders are'} on the train. ${sentence(more)} more ${oneMore ? 'gets' : 'get'} on. How many riders now?`;
  }
  if (task.world === 'dragon') {
    return `The dragon has ${first} ${one ? 'coin' : 'coins'}. Here ${oneMore ? 'comes' : 'come'} ${more} more. How many coins now?`;
  }
  return `${sentence(first)} ${one ? 'dinosaur is' : 'dinosaurs are'} at the picnic. ${sentence(more)} more ${oneMore ? 'comes' : 'come'} along. How many dinosaurs now?`;
}

export function addRight(task: AddTask, turn = 0): string {
  const total = numberWord(task.first + task.more);
  return `${sentence(numberWord(task.first))} and ${numberWord(task.more)} make ${total}! ${PRAISE[turn % PRAISE.length]}`;
}

export const ADD_COUNT = "Oops, not quite! Let's count them.";
export const ADD_PICK = 'Pick a number first!';
export const TRY_AGAIN = 'Now try again!';

export const DONE_LINES = {
  dino: 'Yay! The picnic is ready! See you next time!',
  train: 'All aboard! See you next time!',
  dragon: 'The dragon is so happy! See you next time!',
  path: 'What a lot of counting! See you next time!',
  add: 'So much adding! See you next time!',
};

// The home screen's welcome. Each world is named on its own, so its card can
// jump as the word is said.
export const WELCOME = {
  hello: 'Welcome to',
  train: 'Trains,',
  dragon: 'Dragons,',
  dino: 'and Dinosaurs!',
  choose: 'Choose a game to play!',
};
