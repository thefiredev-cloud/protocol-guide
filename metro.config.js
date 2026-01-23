const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Enable minification in production - drops console.logs and shrinks bundle
if (process.env.NODE_ENV === "production") {
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        keep_fnames: false,
      },
      output: {
        comments: false,
        ascii_only: true,
      },
    },
  };
}

module.exports = withNativeWind(config, {
  input: "./global.css",
  forceWriteFileSystem: true,
});
