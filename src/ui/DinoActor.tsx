// A dinosaur that feels alive: it breathes, blinks, and hops when happy.

import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Dino, Mood } from './art';
import { Dragon } from './worldArt';

type Props = { size: number; variant: number; mood: Mood; reducedMotion: boolean; dragon?: boolean };

export function DinoActor({ size, variant, mood, reducedMotion, dragon }: Props) {
  const lift = useSharedValue(0);
  const squash = useSharedValue(1);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    cancelAnimation(lift);
    cancelAnimation(squash);
    lift.value = 0;
    squash.value = 1;
    if (reducedMotion) return;
    if (mood === 'happy') {
      const hop = size * 0.16;
      lift.value = withDelay(
        variant * 90,
        withRepeat(
          withSequence(
            withTiming(-hop, { duration: 210, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 210, easing: Easing.in(Easing.quad) }),
          ),
          4,
        ),
      );
      return;
    }
    // Slow breathing, offset per dinosaur so they do not move in step.
    squash.value = withDelay(
      variant * 260,
      withRepeat(withTiming(1.035, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [mood, reducedMotion, size, variant]);

  useEffect(() => {
    if (reducedMotion) return;
    let open: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setBlink(true);
      open = setTimeout(() => setBlink(false), 150);
    }, 2800 + variant * 650);
    return () => {
      clearInterval(timer);
      clearTimeout(open);
    };
  }, [reducedMotion, variant]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: lift.value + (1 - squash.value) * size * 0.5 },
      { scaleY: squash.value },
    ],
  }));

  return (
    <Animated.View style={style}>
      {dragon ? (
        <Dragon size={size} mood={mood} blink={blink} />
      ) : (
        <Dino size={size} variant={variant} mood={mood} blink={blink} />
      )}
    </Animated.View>
  );
}
