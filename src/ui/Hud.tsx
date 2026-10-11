// The controls every game shares: home, say-it-again, progress pips, the
// adult's caption and the bell that commits an answer.

import { StyleSheet, Text, View } from 'react-native';

import { BellIcon, HomeIcon, SpeakerIcon } from './art';
import { ChunkyButton } from './ChunkyButton';
import { useUiScale } from './scale';
import { FONT, INK, SUN } from './theme';

type Props = {
  left: number;
  top: number;
  bottom: number;
  captionWidth: number;
  // Where the caption starts, when it should not sit under the top bar.
  captionLeft?: number;
  caption: string;
  progress: { position: number; length: number };
  // Left out in a game where every tap is its own answer.
  bell?: { x: number; y: number; size: number; disabled: boolean };
  onExit: () => void;
  onReplay: () => void;
  onCommit: () => void;
};

export function Hud({ left, top, bottom, captionWidth, captionLeft, caption, progress, bell, onExit, onReplay, onCommit }: Props) {
  const s = useUiScale();
  const pip = { width: 10 * s, height: 10 * s, borderRadius: 5 * s };
  return (
    <>
      <View style={[styles.topBar, { top, left, gap: 10 * s }]}>
        <ChunkyButton size={40 * s} color="#fff" shade="#CFC7DE" label="Home" onPress={onExit}>
          <HomeIcon size={22 * s} />
        </ChunkyButton>
        <ChunkyButton size={48 * s} color="#fff" shade="#CFC7DE" label="Say it again" onPress={onReplay}>
          <SpeakerIcon size={28 * s} />
        </ChunkyButton>
        <View style={styles.pips}>
          {Array.from({ length: progress.length }, (_, index) => (
            <View key={index} style={[styles.pip, pip, index < progress.position && styles.pipDone]} />
          ))}
        </View>
      </View>
      {/* Captions are for the adult; the child hears the line and reads the scene. */}
      {caption !== '' && (
        <View style={[styles.captionRow, { left: captionLeft ?? left, width: captionWidth, bottom }]}>
          <Text style={[styles.caption, { fontSize: 12 * s, lineHeight: 15 * s }]} numberOfLines={2}>
            {caption}
          </Text>
        </View>
      )}
      {bell && (
        <ChunkyButton
          size={bell.size}
          color={SUN}
          shade="#D9981A"
          label="Ready"
          onPress={onCommit}
          disabled={bell.disabled}
          quiet
          style={{ position: 'absolute', left: bell.x - bell.size / 2, top: bell.y - bell.size / 2 - 6 }}
        >
          <BellIcon size={bell.size * 0.62} />
        </ChunkyButton>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 10 },
  pips: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  pip: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#C9C2D9',
    backgroundColor: '#fff',
  },
  pipDone: { borderColor: INK, backgroundColor: SUN },
  captionRow: { position: 'absolute', alignItems: 'flex-start', pointerEvents: 'none' },
  caption: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 15,
    color: INK,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
});
