// How much bigger to draw fixed-size things (buttons, captions, margins) on a
// larger screen. 1 on a phone, rising to about 1.7 on a tablet.

import { useWindowDimensions } from 'react-native';

export function uiScale(width: number, height: number): number {
  return Math.min(1.7, Math.max(1, Math.min(height / 375, width / 700)));
}

export function useUiScale(): number {
  const { width, height } = useWindowDimensions();
  return uiScale(width, height);
}
