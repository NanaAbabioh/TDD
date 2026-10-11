// The grown-ups' area: what the child practised, what they did on their own,
// where support still helped, and one thing to try at home.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Attempt,
  AttemptSkill,
  QUANTITIES,
  focusQuantity,
  makeSetAttempts,
  stateOf,
  themesUsed,
} from '../record/learningRecord';
import type { SaveData, Settings } from '../record/storage';
import { numberWord } from '../voice/lines';
import { CREAM, FONT, INK } from './theme';

type Props = {
  save: SaveData;
  onSettings: (settings: Settings) => void;
  onReset: () => void;
  onBack: () => void;
};

const THEME_NAMES: Record<string, string> = { leaves: 'leaves', cups: 'cups', train: 'train riders' };

function describe(attempts: readonly Attempt[], quantity: number): string {
  const word = numberWord(quantity);
  const state = stateOf(attempts, quantity);
  if (state === 'not-tried') return `${quantity}: not tried yet.`;
  if (state === 'exploring') return `${quantity}: still exploring. Has not yet made ${word} at the first go.`;
  if (state === 'supported') {
    return `${quantity}: made ${word} with matching spaces and counting to guide them.`;
  }
  const using = themesUsed(attempts, quantity).map((theme) => THEME_NAMES[theme]).join(', ');
  const base = `${quantity}: made ${word} without any guide, using ${using}`;
  return state === 'retained' ? `${base}, on more than one day.` : `${base}.`;
}

function supportNote(attempts: readonly Attempt[], quantity: number): string | undefined {
  const recent = makeSetAttempts(attempts, quantity)
    .filter((a) => a.support === 'independent')
    .slice(-5);
  const misses = recent.filter((a) => !a.firstCorrect);
  if (misses.length < 2) return undefined;
  const over = misses.filter((a) => a.firstGiven > quantity).length;
  const habit = over > misses.length / 2 ? 'often put in too many' : 'often stopped too soon';
  return `${quantity}: on their own they ${habit}, then fixed it after seeing the result.`;
}

// A short record for the train and dragon games: only the numbers tried so far.
function worldLines(
  attempts: readonly Attempt[],
  skill: AttemptSkill,
  numbers: number[],
  withHelp: string,
): string[] {
  const lines = numbers.flatMap((n) => {
    const state = stateOf(attempts, n, skill);
    if (state === 'not-tried') return [];
    if (state === 'exploring') return [`${n}: still exploring.`];
    if (state === 'supported') return [`${n}: got there ${withHelp}.`];
    return [`${n}: got there without any help${state === 'retained' ? ', on more than one day' : ''}.`];
  });
  return lines.length > 0 ? lines : ['Not tried yet.'];
}

const UP_TO_TEN = Array.from({ length: 10 }, (_, i) => i + 1);
const FIVE_TO_NINETEEN = Array.from({ length: 15 }, (_, i) => i + 5);

export function ParentScreen({ save, onSettings, onReset, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [confirmReset, setConfirmReset] = useState(false);
  const { attempts, settings } = save;
  const focus = focusQuantity(attempts);
  const notes = QUANTITIES.map((q) => supportNote(attempts, q)).filter(Boolean);

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{
        paddingLeft: insets.left + 24,
        paddingRight: insets.right + 24,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
        gap: 8,
      }}
    >
      <Pressable onPress={onBack} style={styles.button}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>

      <Text style={styles.heading}>Dino Picnic</Text>
      <Text style={styles.body}>
        Making a set: hearing a number and putting exactly that many in the basket, from a bigger
        pile. {save.sessions} {save.sessions === 1 ? 'session' : 'sessions'} so far.
      </Text>
      {QUANTITIES.map((q) => (
        <Text key={q} style={styles.body}>
          {describe(attempts, q)}
        </Text>
      ))}

      {notes.length > 0 && <Text style={styles.heading}>Where support still helped</Text>}
      {notes.map((note) => (
        <Text key={note} style={styles.body}>
          {note}
        </Text>
      ))}

      <Text style={styles.heading}>Train Stops</Text>
      <Text style={styles.body}>
        Driving to a numbered stop: each move along the track is one count, forwards or back.
      </Text>
      {worldLines(attempts, 'drive-to', UP_TO_TEN, 'with the stop numbers showing').map((line) => (
        <Text key={line} style={styles.body}>
          {line}
        </Text>
      ))}

      <Text style={styles.heading}>Dragon Hoard</Text>
      <Text style={styles.body}>
        Building a number on a ten-space tray. Past ten, a full tray becomes one chest, so
        thirteen is one chest and three more.
      </Text>
      {worldLines(attempts, 'hoard', FIVE_TO_NINETEEN, 'with the count showing').map((line) => (
        <Text key={line} style={styles.body}>
          {line}
        </Text>
      ))}

      <Text style={styles.heading}>Try at home</Text>
      <Text style={styles.body}>
        At snack time, put out a pile of spoons or cups and ask for {numberWord(focus)}. Wait, and
        let them decide when they are done. Then ask: "How many did you bring?"
      </Text>
      <Text style={styles.note}>
        This describes what happened in the game. It is not a test score or a measure of ability.
      </Text>

      <Text style={styles.heading}>Settings</Text>
      <View style={styles.setting}>
        <Text style={styles.body}>Voice</Text>
        <Switch value={settings.voice} onValueChange={(voice) => onSettings({ ...settings, voice })} />
      </View>
      <View style={styles.setting}>
        <Text style={styles.body}>Sound effects</Text>
        <Switch value={settings.sound} onValueChange={(sound) => onSettings({ ...settings, sound })} />
      </View>
      <View style={styles.setting}>
        <Text style={styles.body}>Reduce motion</Text>
        <Switch
          value={settings.reducedMotion}
          onValueChange={(reducedMotion) => onSettings({ ...settings, reducedMotion })}
        />
      </View>
      <Text style={styles.note}>Progress is saved on this device only. Nothing is sent anywhere.</Text>

      {confirmReset ? (
        <View style={styles.setting}>
          <Text style={styles.body}>Erase all progress on this device?</Text>
          <Pressable onPress={() => setConfirmReset(false)} style={styles.button}>
            <Text style={styles.buttonText}>Keep</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setConfirmReset(false);
              onReset();
            }}
            style={[styles.button, styles.danger]}
          >
            <Text style={[styles.buttonText, styles.dangerText]}>Erase</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setConfirmReset(true)} style={styles.button}>
          <Text style={styles.buttonText}>Erase progress…</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: CREAM },
  heading: { fontFamily: FONT.semi, fontSize: 19, color: INK, marginTop: 12 },
  body: { fontFamily: FONT.medium, fontSize: 15, lineHeight: 21, color: INK, flexShrink: 1 },
  note: { fontFamily: FONT.medium, fontSize: 13, color: '#6F678A' },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: INK,
    backgroundColor: '#fff',
  },
  buttonText: { fontFamily: FONT.semi, fontSize: 15, color: INK },
  danger: { borderColor: '#B3261E' },
  dangerText: { color: '#B3261E' },
});
