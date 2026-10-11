// Placeholder voice: the device's own text-to-speech.

import * as Speech from 'expo-speech';

import { duckMusic } from './music';

let quietUntil: ReturnType<typeof setTimeout> | undefined;

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
  if (!enabled) return;
  if (interrupt) Speech.stop();
  holdMusicDown(text);
  Speech.speak(text, { language: 'en-US', rate: 0.85, pitch: 1.1, onDone: letMusicUp });
}

export function hush(): void {
  Speech.stop();
  letMusicUp();
}
