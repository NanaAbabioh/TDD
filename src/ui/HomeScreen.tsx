import { ReactNode, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WELCOME } from '../voice/lines';
import { playSound } from '../voice/sounds';
import { Step, saySequence } from '../voice/speak';
import { DinoActor } from './DinoActor';
import type { Game } from './PlayScreen';
import { FONT, INK } from './theme';
import { World } from './World';
import { Engine } from './worldArt';

type Props = {
  reducedMotion: boolean;
  voice: boolean;
  onPlay: (game: Game) => void;
  onParents: () => void;
};

type CardProps = {
  label: string;
  color: string;
  shade: string;
  width: number;
  height: number;
  // Goes up by one each time the card should jump.
  jumps: number;
  still: boolean;
  onPress: () => void;
  children: ReactNode;
};

const DEPTH = 8;

// A big door into one world: a picture the child recognises, on a button that sinks when pressed.
function WorldCard({ label, color, shade, width, height, jumps, still, onPress, children }: CardProps) {
  const lift = useSharedValue(0);
  useEffect(() => {
    if (jumps === 0 || still) return;
    const up = { duration: 170, easing: Easing.out(Easing.quad) };
    const down = { duration: 170, easing: Easing.in(Easing.quad) };
    lift.value = withSequence(
      withTiming(-height * 0.2, up),
      withTiming(0, down),
      withTiming(-height * 0.09, up),
      withTiming(0, down),
    );
  }, [jumps]);
  const jump = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));

  return (
    <Animated.View style={jump}>
      <Pressable
        onPress={() => {
          playSound('tap');
          onPress();
        }}
        accessibilityLabel={label}
        accessibilityRole="button"
        style={{ width, height: height + DEPTH }}
      >
        {({ pressed }) => (
          <>
            <View style={[styles.card, { top: DEPTH, width, height, backgroundColor: shade }]} />
            <View
              style={[
                styles.card,
                styles.face,
                { width, height, backgroundColor: color, transform: [{ translateY: pressed ? DEPTH - 2 : 0 }] },
              ]}
            >
              <View style={styles.picture}>{children}</View>
              <Text style={styles.label} numberOfLines={1}>
                {label}
              </Text>
            </View>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

// The full welcome is said once per launch; coming back to the menu later
// only gets the invitation to choose.
let welcomed = false;

export function HomeScreen({ reducedMotion, voice, onPlay, onParents }: Props) {
  const [jumps, setJumps] = useState({ dino: 0, train: 0, dragon: 0 });

  useEffect(() => {
    const jump = (game: Game) => setJumps((now) => ({ ...now, [game]: now[game] + 1 }));
    const waves: ReturnType<typeof setTimeout>[] = [];
    const everyone = () => {
      (['dino', 'train', 'dragon'] as const).forEach((game, index) => {
        waves.push(setTimeout(() => jump(game), index * 160));
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

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const cardW = Math.min((width - insets.left - insets.right) * 0.27, 250);
  const cardH = Math.min(height * 0.56, cardW * 1.05);
  const art = cardH * 0.66;
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
        <WorldCard label="Dino Picnic" color="#BFEBAE" shade="#6FB868" width={cardW} height={cardH} jumps={jumps.dino} still={reducedMotion} onPress={() => onPlay('dino')}>
          <DinoActor size={art} variant={0} mood="idle" reducedMotion={reducedMotion} />
        </WorldCard>
        <WorldCard label="Train Stops" color="#BFE0FB" shade="#6FA3DB" width={cardW} height={cardH} jumps={jumps.train} still={reducedMotion} onPress={() => onPlay('train')}>
          <Engine height={art * 0.82} happy={false} />
        </WorldCard>
        <WorldCard label="Dragon Hoard" color="#DCCBF5" shade="#9478CC" width={cardW} height={cardH} jumps={jumps.dragon} still={reducedMotion} onPress={() => onPlay('dragon')}>
          <DinoActor size={art} variant={1} mood="idle" reducedMotion={reducedMotion} dragon />
        </WorldCard>
      </View>
      {/* A long press keeps small hands out of the grown-ups' area. */}
      <Pressable
        onLongPress={onParents}
        delayLongPress={1500}
        style={[styles.parents, { right: insets.right + 16, bottom: insets.bottom + 8 }]}
      >
        <Text style={styles.parentsText}>Grown-ups: press and hold</Text>
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
  card: { position: 'absolute', borderRadius: 28, borderWidth: 3, borderColor: INK },
  face: { position: 'relative', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 },
  picture: { flex: 1, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  label: {
    fontFamily: FONT.semi,
    fontSize: 17,
    color: INK,
    paddingVertical: 3,
    paddingHorizontal: 14,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  parents: {
    position: 'absolute',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  parentsText: { fontFamily: FONT.medium, fontSize: 12, color: INK },
});
