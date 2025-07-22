const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add ttf to asset extensions so Metro can handle font files
config.resolver.assetExts.push('ttf');

// Explicitly set node_modules paths to ensure Metro can resolve assets
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;