// Short sound effects. Each is loaded once and replayed from the start.

import { AudioPlayer, createAudioPlayer } from 'expo-audio';

export type Sound =
  | 'success'
  | 'retry'
  | 'pop'
  | 'plop'
  | 'tap'
  | 'fanfare'
  | 'bell'
  | 'coin'
  | 'chest'
  | 'chuff'
  | 'whistle'
  | 'cheer';

// The bell rings first; the result is heard once it has had a moment to sound.
export const AFTER_BELL = 450;

const SOURCES: Record<Sound, number> = {
  success: require('../../assets/sounds/success.wav'),
  retry: require('../../assets/sounds/retry.wav'),
  pop: require('../../assets/sounds/pop.wav'),
  plop: require('../../assets/sounds/plop.wav'),
  tap: require('../../assets/sounds/tap.wav'),
  fanfare: require('../../assets/sounds/fanfare.wav'),
  bell: require('../../assets/sounds/sfx-bell.wav'),
  coin: require('../../assets/sounds/sfx-coin.wav'),
  chest: require('../../assets/sounds/sfx-chest.wav'),
  chuff: require('../../assets/sounds/sfx-chuff.wav'),
  whistle: require('../../assets/sounds/sfx-whistle.wav'),
  cheer: require('../../assets/sounds/sfx-cheer.wav'),
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
