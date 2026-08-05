import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  // TypeScript rules apply to .ts files only — existing JS is untouched.
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.ts'],
  })),
];
