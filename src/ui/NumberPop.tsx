// A numeral that arrives with the spoken word: it bursts in large, holds for
// a moment, then settles to a clear resting size. Numerals are a main part of
// the learning, so they are never small labels.

import { useEffect } from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CORAL, FONT, INK, SUN } from './theme';

type Props = {
  value: number;
  // Diameter at rest.
  size: number;
  // How many times larger it is at the height of the pop.
  burst?: number;
  reducedMotion: boolean;
  // False when the number is on show but has not just been said aloud.
  pop?: boolean;
  // 'alert' marks a number that is not the one asked for.
  tone?: 'sun' | 'alert';
  style?: StyleProp<ViewStyle>;
};

export function NumberPop({ value, size, burst = 2.3, reducedMotion, pop = true, tone = 'sun', style }: Props) {
  const still = reducedMotion || !pop;
  const scale = useSharedValue(still ? 1 : 0.2);

  useEffect(() => {
    if (still) return;
    // Up fast with a little overshoot, hold while the word is said, then settle.
    scale.value = withSequence(
      withTiming(burst, { duration: 260, easing: Easing.out(Easing.back(1.8)) }),
      withDelay(650, withTiming(1, { duration: 340, easing: Easing.inOut(Easing.quad) })),
    );
  }, []);

  const animated = useAnimatedStyle(() => ({
    // In front of everything while it is large.
    zIndex: scale.value > 1.05 ? 30 : 5,
    transform: [{ scale: scale.value }],
  }));

  const digits = String(value).length;
  return (
    <Animated.View
      style={[
        styles.disc,
        { width: size, height: size, borderRadius: size / 2, borderWidth: Math.max(2.5, size * 0.07) },
        tone === 'alert' && styles.alert,
        style,
        animated,
      ]}
    >
      <Text
        style={[styles.text, { fontSize: size * (digits > 1 ? 0.54 : 0.7), lineHeight: size * 0.9 }]}
      >
        {value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  disc: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: INK,
    backgroundColor: SUN,
    pointerEvents: 'none',
  },
  alert: { backgroundColor: '#fff', borderColor: CORAL, borderStyle: 'dashed' },
  text: { fontFamily: FONT.bold, color: INK, textAlign: 'center' },
});
