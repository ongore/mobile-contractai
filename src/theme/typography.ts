import {Platform} from 'react-native';

const iosFontFamily = '-apple-system';
const androidFontFamily = 'Roboto';

export const fontFamily = {
  regular: Platform.OS === 'ios' ? iosFontFamily : androidFontFamily,
  medium: Platform.OS === 'ios' ? iosFontFamily : androidFontFamily,
  semibold: Platform.OS === 'ios' ? iosFontFamily : androidFontFamily,
  bold: Platform.OS === 'ios' ? iosFontFamily : androidFontFamily,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 19,
  '2xl': 22,
  '3xl': 28,
  '4xl': 34,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const lineHeight = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
  xs: 16,
  sm: 18,
  base: 22,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 38,
  '4xl': 42,
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
};

export type Typography = typeof typography;
