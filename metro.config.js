const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep Metro's crawler out of the leftover node_modules copies so bundling
// doesn't stall on dataless (iCloud-offloaded) files.
config.resolver.blockList = /node_modules_[A-Za-z0-9]+\//;

module.exports = config;
