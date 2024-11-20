// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo', // Este preset já cuida do ambiente do Expo
      '@babel/preset-typescript' // Use este se estiver usando TypeScript
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules: true,
        },
      ],
    ],
  };
};
