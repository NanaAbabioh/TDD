// Placeholder voice: the device's own text-to-speech.

import * as Speech from 'expo-speech';

export function say(text: string, enabled: boolean, interrupt = true): void {
  if (!enabled) return;
  if (interrupt) Speech.stop();
  Speech.speak(text, { language: 'en-US', rate: 0.85, pitch: 1.1 });
}

export function hush(): void {
  Speech.stop();
}
