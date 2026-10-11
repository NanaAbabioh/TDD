// Shared look: ink colour, fonts and the palette of each setting.

import type { Theme } from '../activity/tasks';

export const INK = '#33294D';
export const CREAM = '#FFF9EC';
export const CORAL = '#FF7A59';
export const SUN = '#FFC93C';

export const FONT = {
  medium: 'Fredoka_500Medium',
  semi: 'Fredoka_600SemiBold',
  bold: 'Fredoka_700Bold',
};

export type WorldName = Theme | 'dragon';

export type WorldPalette = {
  sun: string;
  skyTop: string;
  skyBottom: string;
  farHill: string;
  tree: string;
  groundTop: string;
  groundBottom: string;
  tuft: string;
};

export const WORLD: Record<WorldName, WorldPalette> = {
  // A bright morning meadow.
  leaves: {
    sun: '#FFE27A',
    skyTop: '#7FD3F7',
    skyBottom: '#DFF7EC',
    farHill: '#A6DE9E',
    tree: '#5FB56A',
    groundTop: '#8FD47E',
    groundBottom: '#5FB868',
    tuft: '#4FA65C',
  },
  // The same meadow in warm afternoon light.
  cups: {
    sun: '#FFE27A',
    skyTop: '#FFC97A',
    skyBottom: '#FFF3D6',
    farHill: '#D3DE8E',
    tree: '#9DBB5C',
    groundTop: '#BAD677',
    groundBottom: '#8DBB5E',
    tuft: '#7AA850',
  },
  // A station platform under a clear sky.
  train: {
    sun: '#FFE27A',
    skyTop: '#8FC4FA',
    skyBottom: '#EAF4FF',
    farHill: '#B4D6AE',
    tree: '#7FB98A',
    groundTop: '#EBDCBE',
    groundBottom: '#D3BE96',
    tuft: '#BDA77C',
  },
  // Dusk outside the dragon's cave: purple mountains and warm stone.
  dragon: {
    sun: '#FFF1C2',
    skyTop: '#6E5DB8',
    skyBottom: '#F8C9B6',
    farHill: '#9484CC',
    tree: '#6F5FAF',
    groundTop: '#E2BE94',
    groundBottom: '#BC9167',
    tuft: '#A67C52',
  },
};
