// A round button that looks pressable: a face sitting on a darker base,
// which sinks when touched.

import { ReactNode } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { INK } from './theme';

type Props = {
  size: number;
  color: string;
  shade: string;
  label: string;
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

const DEPTH = 6;

export function ChunkyButton({
  size,
  color,
  shade,
  label,
  onPress,
  onLongPress,
  delayLongPress,
  disabled,
  style,
  children,
}: Props) {
  const round = { width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: INK };
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={[{ width: size, height: size + DEPTH, opacity: disabled ? 0.55 : 1 }, style]}
    >
      {({ pressed }) => (
        <>
          <View style={[round, { position: 'absolute', top: DEPTH, backgroundColor: shade }]} />
          <View
            style={[
              round,
              {
                backgroundColor: color,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ translateY: pressed ? DEPTH - 1 : 0 }],
              },
            ]}
          >
            {children}
          </View>
        </>
      )}
    </Pressable>
  );
}
