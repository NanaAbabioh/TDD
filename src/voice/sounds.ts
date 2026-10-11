// Short sound effects. Each is loaded once and replayed from the start.

import { AudioPlayer, createAudioPlayer } from 'expo-audio';

export type Sound = 'success' | 'retry';

const SOURCES: Record<Sound, number> = {
  success: require('../../assets/sounds/success.wav'),
  retry: require('../../assets/sounds/retry.wav'),
};

const players: Partial<Record<Sound, AudioPlayer>> = {};

export function playSound(name: Sound, enabled: boolean): void {
  if (!enabled) return;
  try {
    const player = (players[name] ??= createAudioPlayer(SOURCES[name]));
    player.seekTo(0);
    player.play();
  } catch {
    // The game is fully playable without sound.
  }
}
