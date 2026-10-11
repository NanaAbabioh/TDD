// Short sound effects. Each is loaded once and replayed from the start.

import { AudioPlayer, createAudioPlayer } from 'expo-audio';

export type Sound = 'success' | 'retry' | 'pop' | 'plop' | 'tap' | 'fanfare';

const SOURCES: Record<Sound, number> = {
  success: require('../../assets/sounds/success.wav'),
  retry: require('../../assets/sounds/retry.wav'),
  pop: require('../../assets/sounds/pop.wav'),
  plop: require('../../assets/sounds/plop.wav'),
  tap: require('../../assets/sounds/tap.wav'),
  fanfare: require('../../assets/sounds/fanfare.wav'),
};

const players: Partial<Record<Sound, AudioPlayer>> = {};
// Follows the grown-ups' "Sound effects" switch.
let enabled = true;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

export function playSound(name: Sound): void {
  if (!enabled) return;
  try {
    const player = (players[name] ??= createAudioPlayer(SOURCES[name]));
    player.seekTo(0);
    player.play();
  } catch {
    // The game is fully playable without sound.
  }
}
