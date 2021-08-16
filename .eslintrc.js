const path = require('path');

module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {},
  parserOptions: {
    sourceType: 'module'
  },
  "parser": "babel-eslint",
  "rules": {
    "strict": 0
  },
  extends: 'airbnb-base',
  rules: {
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'no-continue': 0,
    'no-bitwise': [2, { allow: ['<<', '>>'] }],
    'import/prefer-default-export': 'off',
    'no-constant-condition': 0,
    'no-param-reassign': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true
      }
    ],
    'prefer-destructuring': ['error', {
      'array': false,
      'object': true
    }, {
      'enforceForRenamedProperties': false
    }]
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: path.resolve(__dirname, 'webpack.common.js')
      }
    }
  },
};
