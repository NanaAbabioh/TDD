// A big door: a picture the child recognises, on a button that sinks when
// pressed and can jump to draw the eye when its name is spoken.

import { ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { playSound } from '../voice/sounds';
import { FONT, INK } from './theme';

type Props = {
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

export function WorldCard({ label, color, shade, width, height, jumps, still, onPress, children }: Props) {
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

const styles = StyleSheet.create({
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
});
