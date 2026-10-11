// A short burst of paper bits for a finished task.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#FF7A59', '#FFC93C', '#6FB7F5', '#B48AE0', '#6CCB6B', '#FF8FA3'];
const COUNT = 26;

type BitProps = { index: number; progress: SharedValue<number>; x: number; y: number; spread: number };

function Bit({ index, progress, x, y, spread }: BitProps) {
  const angle = (index / COUNT) * Math.PI * 2 + (index % 3) * 0.35;
  const reach = spread * (0.45 + ((index * 37) % 10) / 13);
  const spin = index % 2 === 0 ? 420 : -420;
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: 1 - p * p * p,
      transform: [
        { translateX: x + Math.cos(angle) * reach * p },
        { translateY: y + Math.sin(angle) * reach * p + spread * 0.6 * p * p },
        { rotate: `${p * spin}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: -6,
          top: -6,
          width: 12,
          height: index % 2 === 0 ? 12 : 7,
          borderRadius: index % 3 === 0 ? 6 : 2,
          backgroundColor: COLORS[index % COLORS.length],
        },
        style,
      ]}
    />
  );
}

export function Confetti({ x, y, spread }: { x: number; y: number; spread: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1700, easing: Easing.out(Easing.cubic) });
  }, []);
  return (
    <View style={[StyleSheet.absoluteFill, styles.untouchable]}>
      {Array.from({ length: COUNT }, (_, index) => (
        <Bit key={index} index={index} progress={progress} x={x} y={y} spread={spread} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  untouchable: { pointerEvents: 'none' },
});
