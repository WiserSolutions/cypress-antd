module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        modules: false,
        corejs: 3
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'
      }
    ],
    ['@babel/preset-typescript']
  ],
  plugins: ['@babel/plugin-proposal-nullish-coalescing-operator', 'styled-components']
}
