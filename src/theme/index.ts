export * from './colors';
export * from './typography';
export * from './spacing';

export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  borderRadius: require('./spacing').borderRadius,
  shadow: require('./spacing').shadow,
};

export type Theme = typeof theme;
