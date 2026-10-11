// Placeholder voice: the device's own text-to-speech, pitched up and a little
// quicker so it sounds young. A recorded child's voice can replace it later.

import * as Speech from 'expo-speech';

import { duckMusic } from './music';

const VOICE = { language: 'en-US', rate: 0.95, pitch: 1.6 };

let quietUntil: ReturnType<typeof setTimeout> | undefined;
// Bumped whenever something new is said, which stops any running sequence.
let turn = 0;

// The music stays low while a line is spoken. A timer backs up the speech
// callbacks, which not every device reports.
function holdMusicDown(text: string): void {
  duckMusic(true);
  clearTimeout(quietUntil);
  quietUntil = setTimeout(() => duckMusic(false), 900 + text.length * 85);
}

function letMusicUp(): void {
  clearTimeout(quietUntil);
  duckMusic(false);
}

export function say(text: string, enabled: boolean, interrupt = true): void {
  turn++;
  if (!enabled) return;
  if (interrupt) Speech.stop();
  holdMusicDown(text);
  Speech.speak(text, { ...VOICE, onDone: letMusicUp });
}

export function hush(): void {
  turn++;
  Speech.stop();
  letMusicUp();
}

export type Step = { text: string; onStart?: () => void };

// Says the steps one after another, calling onStart as each begins, so the
// screen can act in time with the words. With the voice off the steps still
// run, silently. Returns a function that stops the sequence.
export function saySequence(steps: Step[], enabled: boolean): () => void {
  const mine = ++turn;
  let timer: ReturnType<typeof setTimeout> | undefined;
  if (enabled) Speech.stop();

  const run = (index: number) => {
    if (mine !== turn || index >= steps.length) return;
    const step = steps[index];
    step.onStart?.();
    let moved = false;
    const next = () => {
      if (moved) return;
      moved = true;
      clearTimeout(timer);
      run(index + 1);
    };
    if (!enabled) {
      timer = setTimeout(next, 450 + step.text.length * 45);
      return;
    }
    holdMusicDown(step.text);
    Speech.speak(step.text, { ...VOICE, onDone: next, onError: next });
    // In case the device never reports that the words finished.
    timer = setTimeout(next, 1400 + step.text.length * 110);
  };
  run(0);

  return () => {
    if (mine === turn) turn++;
    clearTimeout(timer);
  };
}
