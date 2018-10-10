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
  extends: 'airbnb-base',
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true
      }
    ]
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: path.resolve(__dirname, 'webpack.common.js')
      }
    }
  },
};
