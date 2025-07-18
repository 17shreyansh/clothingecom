module.exports = function override(config, env) {
  // Disable source maps
  config.devtool = false;
  
  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "util": require.resolve("util/")
  };
  
  // Ignore source map warnings
  config.ignoreWarnings = [/Failed to parse source map/];
  
  return config;
};