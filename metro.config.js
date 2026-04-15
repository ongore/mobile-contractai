const {getDefaultConfig} = require('expo/metro-config');

/**
 * Metro configuration (Expo).
 * NativeWind v2 does not use `nativewind/metro` — that is v4+ only.
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Keep Expo defaults; add extensions used by some npm packages (e.g. zod ESM/CJS).
const {sourceExts} = config.resolver;
for (const ext of ['cjs', 'mjs']) {
  if (!sourceExts.includes(ext)) {
    sourceExts.push(ext);
  }
}

module.exports = config;
