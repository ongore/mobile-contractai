module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
    ['nativewind/babel', {mode: 'transformOnly'}],
    // Must stay last — reorders other plugins internally
    'react-native-reanimated/plugin',
  ],
};
