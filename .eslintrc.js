const path = require('path');

module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {},
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  parser: 'babel-eslint',
  extends: ['airbnb-base', 'prettier'],
  rules: {
    strict: 0,
    'no-unused-vars': 'error',
    'prettier/prettier': 'error',
    'linebreak-style': ['error', 'unix'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-continue': 0,
    'no-bitwise': [2, { allow: ['<<', '>>'] }],
    'import/prefer-default-export': 'off',
    'no-constant-condition': 0,
    'no-param-reassign': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
  },
  plugins: ['prettier'],
  settings: {
    'import/resolver': {
      webpack: {
        config: path.resolve(__dirname, 'config/webpack.common.js'),
      },
    },
  },
};
