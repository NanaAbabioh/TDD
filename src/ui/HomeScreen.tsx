// The front door: one card for each world. Tapping a world opens its games.

import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WELCOME } from '../voice/lines';
import { Step, saySequence } from '../voice/speak';
import { DinoActor } from './DinoActor';
import type { WorldId } from './PlayScreen';
import { useUiScale } from './scale';
import { FONT, INK } from './theme';
import { World } from './World';
import { WorldCard } from './WorldCard';
import { Engine } from './worldArt';

type Props = {
  reducedMotion: boolean;
  voice: boolean;
  onOpen: (world: WorldId) => void;
  onParents: () => void;
};

// The full welcome is said once per launch; coming back to the menu later
// only gets the invitation to choose.
let welcomed = false;

export function HomeScreen({ reducedMotion, voice, onOpen, onParents }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [jumps, setJumps] = useState({ dino: 0, train: 0, dragon: 0 });

  useEffect(() => {
    const jump = (world: WorldId) => setJumps((now) => ({ ...now, [world]: now[world] + 1 }));
    const waves: ReturnType<typeof setTimeout>[] = [];
    const everyone = () => {
      (['dino', 'train', 'dragon'] as const).forEach((world, index) => {
        waves.push(setTimeout(() => jump(world), index * 160));
      });
    };
    // Each card jumps as its world is named, in the order of the title.
    const greeting: Step[] = [
      { text: WELCOME.hello },
      { text: WELCOME.train, onStart: () => jump('train') },
      { text: WELCOME.dragon, onStart: () => jump('dragon') },
      { text: WELCOME.dino, onStart: () => jump('dino') },
    ];
    const steps = [...(welcomed ? [] : greeting), { text: WELCOME.choose, onStart: everyone }];

    let cancel = () => {};
    const begin = () => {
      welcomed = true;
      cancel = saySequence(steps, voice);
    };
    // Browsers will not speak until the page has been touched once.
    const mustWait =
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      navigator.userActivation?.hasBeenActive === false;
    const delay = setTimeout(() => {
      if (mustWait) document.addEventListener('pointerdown', begin, { once: true });
      else begin();
    }, 700);

    return () => {
      clearTimeout(delay);
      waves.forEach(clearTimeout);
      if (mustWait) document.removeEventListener('pointerdown', begin);
      cancel();
    };
  }, []);

  const s = useUiScale();
  const cardW = Math.min((width - insets.left - insets.right) * 0.27, 250 * s);
  // Taller cards on a squarer tablet screen.
  const cardH = Math.min(height * 0.56, cardW * 1.35);
  const art = Math.min(cardH * 0.66, cardW * 0.84);
  const titleSize = Math.min(height * 0.115, width * 0.052);

  return (
    <View style={styles.fill}>
      <World theme="leaves" width={width} height={height} reducedMotion={reducedMotion} lush />
      <View style={styles.titleWrap}>
        <Text style={[styles.title, styles.titleShadow, { fontSize: titleSize }]}>
          Trains, Dragons & Dinosaurs
        </Text>
        <Text style={[styles.title, { fontSize: titleSize }]}>Trains, Dragons & Dinosaurs</Text>
      </View>
      <View style={[styles.row, { gap: width * 0.03 }]}>
        <WorldCard label="Trains" color="#BFE0FB" shade="#6FA3DB" width={cardW} height={cardH} jumps={jumps.train} still={reducedMotion} onPress={() => onOpen('train')}>
          <Engine height={art * 0.82} happy={false} />
        </WorldCard>
        <WorldCard label="Dragons" color="#DCCBF5" shade="#9478CC" width={cardW} height={cardH} jumps={jumps.dragon} still={reducedMotion} onPress={() => onOpen('dragon')}>
          <DinoActor size={art} variant={1} mood="idle" reducedMotion={reducedMotion} dragon />
        </WorldCard>
        <WorldCard label="Dinosaurs" color="#BFEBAE" shade="#6FB868" width={cardW} height={cardH} jumps={jumps.dino} still={reducedMotion} onPress={() => onOpen('dino')}>
          <DinoActor size={art} variant={0} mood="idle" reducedMotion={reducedMotion} />
        </WorldCard>
      </View>
      {/* A long press keeps small hands out of the grown-ups' area. */}
      <Pressable
        onLongPress={onParents}
        delayLongPress={1500}
        style={[styles.parents, { right: insets.right + 16, bottom: insets.bottom + 8 }]}
      >
        <Text style={[styles.parentsText, { fontSize: 12 * s }]}>Grown-ups: press and hold</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DFF7EC' },
  titleWrap: { marginBottom: 10 },
  title: { fontFamily: FONT.bold, color: '#fff', letterSpacing: 0.5 },
  // A second copy sitting just below gives the letters a solid drop edge.
  titleShadow: { position: 'absolute', top: 4, color: INK },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  parents: {
    position: 'absolute',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  parentsText: { fontFamily: FONT.medium, fontSize: 12, color: INK },
});
