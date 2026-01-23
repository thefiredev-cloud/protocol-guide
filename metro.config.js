const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Optimize bundle size by excluding test files and skill templates
// Note: We can't exclude server directory as some types might be shared
config.resolver.blockList = [
  // Exclude test files
  /.*\.test\.(ts|tsx|js|jsx)$/,
  // Exclude benchmark files
  /.*\.bench\.(ts|tsx|js|jsx)$/,
  // Exclude stories
  /.*\.stories\.(ts|tsx|js|jsx)$/,
  // Exclude skill templates (but not node_modules)
  /^(?!.*node_modules).*\/(\.agents|\.opencode|\.claude|\.cursor|\.factory|\.gemini|\.github|\.codex)\/skills\/.*/,
];

// Optimize module resolution
config.resolver.sourceExts = ["tsx", "ts", "jsx", "js", "json"];

// Enable minification in production
if (process.env.NODE_ENV === "production") {
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      compress: {
        drop_console: true, // Remove console.log statements
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        keep_fnames: false, // Mangle function names for smaller bundle
      },
      output: {
        comments: false, // Remove comments
        ascii_only: true,
      },
    },
  };
}

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
