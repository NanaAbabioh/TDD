// The landscape behind every scene: sky, sun, drifting clouds, hills and
// ground. Kept calm and low in contrast so it never competes with the
// objects the child is counting.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { WORLD, WorldName } from './theme';

type Props = { theme: WorldName; width: number; height: number; reducedMotion: boolean; lush?: boolean };

function Cloud({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 0.5} viewBox="0 0 120 60">
      <Ellipse cx={60} cy={44} rx={52} ry={14} fill="#fff" />
      <Circle cx={40} cy={34} r={18} fill="#fff" />
      <Circle cx={64} cy={26} r={22} fill="#fff" />
      <Circle cx={86} cy={36} r={15} fill="#fff" />
    </Svg>
  );
}

function Drift({ x, y, size, travel, still }: { x: number; y: number; size: number; travel: number; still: boolean }) {
  const shift = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    shift.value = withRepeat(
      withTiming(travel, { duration: 26000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [still, travel]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shift.value }] }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y, opacity: 0.85 }, style]}>
      <Cloud size={size} />
    </Animated.View>
  );
}

function Tree({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <G>
      <Rect x={x - s * 0.08} y={y - s * 0.5} width={s * 0.16} height={s * 0.55} rx={s * 0.06} fill="#9A6B4B" />
      <Circle cx={x - s * 0.24} cy={y - s * 0.62} r={s * 0.3} fill={color} />
      <Circle cx={x + s * 0.24} cy={y - s * 0.62} r={s * 0.3} fill={color} />
      <Circle cx={x} cy={y - s * 0.88} r={s * 0.36} fill={color} />
    </G>
  );
}

// Steady pseudo-random number in [0, 1).
function scatter(index: number, salt: number): number {
  const raw = Math.sin((index + 1) * 91.17 + salt * 37.71) * 9973.13;
  return raw - Math.floor(raw);
}

export function World({ theme, width: w, height: h, reducedMotion, lush }: Props) {
  const palette = WORLD[theme];
  const horizon = h * 0.25;
  const farHill =
    `M0 ${horizon} Q ${w * 0.16} ${horizon - h * 0.17} ${w * 0.36} ${horizon - h * 0.04}` +
    ` Q ${w * 0.56} ${horizon + h * 0.05} ${w * 0.74} ${horizon - h * 0.09}` +
    ` Q ${w * 0.9} ${horizon - h * 0.17} ${w} ${horizon - h * 0.05} L ${w} ${h} L 0 ${h} Z`;
  const ground =
    `M0 ${horizon + h * 0.04} Q ${w * 0.28} ${horizon - h * 0.05} ${w * 0.55} ${horizon + h * 0.03}` +
    ` Q ${w * 0.8} ${horizon + h * 0.09} ${w} ${horizon + h * 0.01} L ${w} ${h} L 0 ${h} Z`;
  const tufts = Array.from({ length: lush ? 16 : 9 }, (_, i) => ({
    x: scatter(i, 1) * w,
    y: horizon + h * 0.14 + scatter(i, 2) * (h * 0.82 - horizon),
    s: h * (0.022 + scatter(i, 3) * 0.014),
  }));
  const flowers = lush
    ? Array.from({ length: 10 }, (_, i) => ({
        x: scatter(i, 4) * w,
        y: horizon + h * 0.2 + scatter(i, 5) * (h * 0.74 - horizon),
        tint: ['#FFFFFF', '#FFE27A', '#FFB3C7'][i % 3],
      }))
    : [];

  return (
    <View style={[StyleSheet.absoluteFill, styles.untouchable]}>
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id={`sky-${theme}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.skyTop} />
            <Stop offset="1" stopColor={palette.skyBottom} />
          </LinearGradient>
          <LinearGradient id={`ground-${theme}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.groundTop} />
            <Stop offset="1" stopColor={palette.groundBottom} />
          </LinearGradient>
          <RadialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFF6C9" stopOpacity={0.95} />
            <Stop offset="1" stopColor="#FFF6C9" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={w} height={horizon + h * 0.1} fill={`url(#sky-${theme})`} />
        <Circle cx={w * 0.42} cy={h * 0.1} r={h * 0.17} fill="url(#sun-glow)" />
        <Circle cx={w * 0.42} cy={h * 0.1} r={h * 0.058} fill={palette.sun} />
        <Path d={farHill} fill={palette.farHill} />
        <Tree x={w * 0.035} y={horizon - h * 0.02} s={h * 0.11} color={palette.tree} />
        <Tree x={w * 0.36} y={horizon - h * 0.01} s={h * 0.09} color={palette.tree} />
        <Tree x={w * 0.965} y={horizon - h * 0.04} s={h * 0.12} color={palette.tree} />
        <Path d={ground} fill={`url(#ground-${theme})`} />
        {tufts.map((tuft, i) => (
          <Path
            key={i}
            d={`M${tuft.x - tuft.s} ${tuft.y} q ${tuft.s * 0.3} ${-tuft.s * 1.2} ${tuft.s * 0.6} ${-tuft.s * 0.2} q ${tuft.s * 0.4} ${-tuft.s * 1.6} ${tuft.s * 0.8} 0 q ${tuft.s * 0.3} ${-tuft.s} ${tuft.s * 0.6} ${tuft.s * 0.2}`}
            stroke={palette.tuft}
            strokeWidth={Math.max(2, tuft.s * 0.28)}
            strokeLinecap="round"
            fill="none"
            opacity={0.55}
          />
        ))}
        {flowers.map((flower, i) => (
          <G key={i}>
            <Circle cx={flower.x} cy={flower.y} r={h * 0.012} fill={flower.tint} />
            <Circle cx={flower.x} cy={flower.y} r={h * 0.005} fill="#F29F4B" />
          </G>
        ))}
      </Svg>
      <Drift x={w * 0.5} y={h * 0.015} size={h * 0.26} travel={w * 0.08} still={reducedMotion} />
      <Drift x={w * 0.78} y={h * 0.075} size={h * 0.17} travel={-w * 0.06} still={reducedMotion} />
    </View>
  );
}

const styles = StyleSheet.create({
  untouchable: { pointerEvents: 'none' },
});
