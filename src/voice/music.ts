// Background music: one quiet looping track per world. It dips further
// whenever the voice speaks, so the number words are always the clearest sound.

import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

export type Track = 'home' | 'dino' | 'train' | 'dragon';

const SOURCES: Record<Track, number> = {
  home: require('../../assets/sounds/music-home.wav'),
  dino: require('../../assets/sounds/music-dino.wav'),
  train: require('../../assets/sounds/music-train.wav'),
  dragon: require('../../assets/sounds/music-dragon.wav'),
};

const VOLUME = 0.22;
const DUCKED = 0.07;

const players: Partial<Record<Track, AudioPlayer>> = {};
let current: Track | undefined;
let ducked = false;
let waitingForTouch = false;

function stop(): void {
  if (current) players[current]?.pause();
  current = undefined;
}

function start(track: Track): void {
  try {
    const player = (players[track] ??= createAudioPlayer(SOURCES[track]));
    player.loop = true;
    player.volume = ducked ? DUCKED : VOLUME;
    player.seekTo(0);
    player.play();
    current = track;
  } catch {
    // The game is fully playable without music.
  }
}

// Plays the given track, or silence when it is undefined.
export function setMusic(track: Track | undefined): void {
  if (track === current) return;
  stop();
  if (!track) return;
  start(track);
  // Browsers hold audio back until the first touch; begin again then.
  if (Platform.OS === 'web' && !waitingForTouch && typeof document !== 'undefined') {
    waitingForTouch = true;
    document.addEventListener(
      'pointerdown',
      () => {
        waitingForTouch = false;
        if (current && !players[current]?.playing) players[current]?.play();
      },
      { once: true },
    );
  }
}

export function duckMusic(down: boolean): void {
  ducked = down;
  const player = current && players[current];
  if (player) player.volume = down ? DUCKED : VOLUME;
}
