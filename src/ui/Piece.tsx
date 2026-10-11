// One movable object. It can be dragged, or tapped as an easier alternative.

import { ReactNode, useEffect, useRef } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

export type Release = { tap: boolean; x: number; y: number };

type Props = {
  x: number;
  y: number;
  size: number;
  disabled: boolean;
  reducedMotion: boolean;
  onRelease: (release: Release) => void;
  children: ReactNode;
};

export function Piece({ x, y, size, disabled, reducedMotion, onRelease, children }: Props) {
  const tx = useSharedValue(x);
  const ty = useSharedValue(y);
  const lift = useSharedValue(0);

  const glide = (to: number) =>
    reducedMotion ? withTiming(to, { duration: 1 }) : withSpring(to, { damping: 18, stiffness: 180 });

  useEffect(() => {
    tx.value = glide(x);
    ty.value = glide(y);
  }, [x, y]);

  // Measured from where the finger first touched, so the item stays under it.
  const grab = useRef({ x: 0, y: 0 }).current;
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    .minDistance(10)
    .onBegin((event) => {
      grab.x = event.absoluteX;
      grab.y = event.absoluteY;
    })
    .onStart(() => {
      lift.value = 1;
    })
    .onUpdate((event) => {
      tx.value = x + event.absoluteX - grab.x;
      ty.value = y + event.absoluteY - grab.y;
    })
    .onEnd((event) => {
      // Glide home first; if the drop moved the item, the new spot arrives as props.
      tx.value = glide(x);
      ty.value = glide(y);
      onRelease({ tap: false, x: x + event.absoluteX - grab.x, y: y + event.absoluteY - grab.y });
    })
    .onFinalize(() => {
      lift.value = 0;
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .enabled(!disabled)
    .maxDistance(10)
    .onEnd(() => onRelease({ tap: true, x, y }));

  const style = useAnimatedStyle(() => ({
    zIndex: lift.value ? 10 : 1,
    transform: [
      { translateX: tx.value - size / 2 },
      { translateY: ty.value - size / 2 },
      { scale: withTiming(lift.value ? 1.2 : 1, { duration: 120 }) },
      { rotate: withTiming(lift.value ? '-6deg' : '0deg', { duration: 120 }) },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
