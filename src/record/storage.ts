// Saves the learning record on the device. No accounts, no network.

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Attempt } from './learningRecord';

export type Settings = { voice: boolean; sound: boolean; music: boolean; reducedMotion: boolean };

export type SaveData = {
  version: 1;
  sessions: number;
  attempts: Attempt[];
  settings: Settings;
};

const KEY = 'tdd.save';
// The previous good save, in case a write is interrupted.
const BACKUP_KEY = 'tdd.save.backup';

export function emptySave(): SaveData {
  return { version: 1, sessions: 0, attempts: [], settings: { voice: true, sound: true, music: true, reducedMotion: false } };
}

function parse(raw: string | null): SaveData | undefined {
  if (!raw) return undefined;
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Array.isArray(data.attempts)) return undefined;
    return { ...emptySave(), ...data, settings: { ...emptySave().settings, ...data.settings } };
  } catch {
    return undefined;
  }
}

export async function loadSave(): Promise<SaveData> {
  try {
    const main = parse(await AsyncStorage.getItem(KEY));
    if (main) return main;
    return parse(await AsyncStorage.getItem(BACKUP_KEY)) ?? emptySave();
  } catch {
    return emptySave();
  }
}

export async function writeSave(data: SaveData): Promise<void> {
  try {
    const previous = await AsyncStorage.getItem(KEY);
    if (parse(previous)) await AsyncStorage.setItem(BACKUP_KEY, previous as string);
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Play carries on from memory; the next save tries again.
  }
}
