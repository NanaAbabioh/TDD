// The games inside one world: its own game, a Number Path and Adding Up.

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WORLD_NAMES } from '../voice/lines';
import { saySequence } from '../voice/speak';
import { HomeIcon } from './art';
import { ChunkyButton } from './ChunkyButton';
import { DinoActor } from './DinoActor';
import type { Game, WorldId } from './PlayScreen';
import { FONT, INK } from './theme';
import { World } from './World';
import { WorldCard } from './WorldCard';
import { AddArt, Engine, PathArt } from './worldArt';

type Props = {
  world: WorldId;
  reducedMotion: boolean;
  voice: boolean;
  onPlay: (game: Game) => void;
  onHome: () => void;
};

const LOOK = {
  dino: { scene: 'leaves', label: 'Dino Picnic', color: '#BFEBAE', shade: '#6FB868' },
  train: { scene: 'train', label: 'Train Stops', color: '#BFE0FB', shade: '#6FA3DB' },
  dragon: { scene: 'dragon', label: 'Dragon Hoard', color: '#DCCBF5', shade: '#9478CC' },
} as const;

export function WorldMenu({ world, reducedMotion, voice, onPlay, onHome }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [jumps, setJumps] = useState({ main: 0, path: 0, add: 0 });
  const look = LOOK[world];

  useEffect(() => {
    const waves: ReturnType<typeof setTimeout>[] = [];
    const wave = () => {
      (['main', 'path', 'add'] as const).forEach((card, index) => {
        waves.push(setTimeout(() => setJumps((now) => ({ ...now, [card]: now[card] + 1 })), index * 160));
      });
    };
    let cancel = () => {};
    const delay = setTimeout(() => {
      cancel = saySequence([{ text: `${WORLD_NAMES[world]}!` }, { text: 'Choose a game to play!', onStart: wave }], voice);
    }, 500);
    return () => {
      clearTimeout(delay);
      waves.forEach(clearTimeout);
      cancel();
    };
  }, []);

  const cardW = Math.min((width - insets.left - insets.right) * 0.27, 250);
  const cardH = Math.min(height * 0.56, cardW * 1.05);
  const art = cardH * 0.66;
  const titleSize = Math.min(height * 0.13, width * 0.06);

  return (
    <View style={styles.fill}>
      <World theme={look.scene} width={width} height={height} reducedMotion={reducedMotion} lush />
      <View style={{ position: 'absolute', left: insets.left + 12, top: insets.top + 6 }}>
        <ChunkyButton size={48} color="#fff" shade="#CFC7DE" label="Home" onPress={onHome}>
          <HomeIcon size={26} />
        </ChunkyButton>
      </View>
      <View style={styles.titleWrap}>
        <Text style={[styles.title, styles.titleShadow, { fontSize: titleSize }]}>{WORLD_NAMES[world]}</Text>
        <Text style={[styles.title, { fontSize: titleSize }]}>{WORLD_NAMES[world]}</Text>
      </View>
      <View style={[styles.row, { gap: width * 0.03 }]}>
        <WorldCard label={look.label} color={look.color} shade={look.shade} width={cardW} height={cardH} jumps={jumps.main} still={reducedMotion} onPress={() => onPlay(world)}>
          {world === 'train' ? (
            <Engine height={art * 0.82} happy={false} />
          ) : (
            <DinoActor size={art} variant={0} mood="idle" reducedMotion={reducedMotion} dragon={world === 'dragon'} />
          )}
        </WorldCard>
        <WorldCard label="Number Path" color="#FFE3B8" shade="#E0A04E" width={cardW} height={cardH} jumps={jumps.path} still={reducedMotion} onPress={() => onPlay('path')}>
          <PathArt size={art * 0.9} />
        </WorldCard>
        <WorldCard label="Adding Up" color="#FFD3C7" shade="#E0705A" width={cardW} height={cardH} jumps={jumps.add} still={reducedMotion} onPress={() => onPlay('add')}>
          <AddArt size={art * 0.9} />
        </WorldCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DFF7EC' },
  titleWrap: { marginBottom: 10 },
  title: { fontFamily: FONT.bold, color: '#fff', letterSpacing: 0.5 },
  titleShadow: { position: 'absolute', top: 4, color: INK },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
});
