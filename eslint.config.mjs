// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

import tsEslintParser from '@typescript-eslint/parser';
// @ts-expect-error babelParser is not a module
import babelParser from '@babel/eslint-parser';
const flatConfig = [
  {
    files: ['*.js', '*.cjs', '*.json', '*.md', '*.yml', '*.yaml'],
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'jest/no-if': 'off',
      'perfectionist/sort-array-includes': 'off',
      'perfectionist/sort-astro-attributes': 'off',
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-enums': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-interfaces': 'off',
      'perfectionist/sort-jsx-props': 'off',
      'perfectionist/sort-keys': 'off',
      'perfectionist/sort-maps': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-svelte-attributes': 'off',
      'perfectionist/sort-union-types': 'off',
      'perfectionist/sort-vue-attributes': 'off',
    },
  },
  {
    files: ['packages/eslint-config-payload/**'],
    rules: {
      'perfectionist/sort-objects': 'off',
    },
  },
  {
    files: ['package.json', 'tsconfig.json'],
    rules: {
      'jest/no-if': 'off',
      'perfectionist/sort-array-includes': 'off',
      'perfectionist/sort-astro-attributes': 'off',
      'perfectionist/sort-classes': 'off',
      'perfectionist/sort-enums': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-interfaces': 'off',
      'perfectionist/sort-jsx-props': 'off',
      'perfectionist/sort-keys': 'off',
      'perfectionist/sort-maps': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-objects': 'off',
      'perfectionist/sort-svelte-attributes': 'off',
      'perfectionist/sort-union-types': 'off',
      'perfectionist/sort-vue-attributes': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsEslintParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'jest/no-if': 'off',
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      semi: 'error',
      'space-in-parens': 'error',
    },
  },
  {
    ignores: [
      '**/.git/',
      '**/coverage/',
      '**/dist/**',
      '**/build/',
      '**/temp/',
      '**/node_modules/',
      '**/public/',
      '**/scripts/',
      '**/src/migrations/',
    ],
  },
];

export default [eslint.configs.recommended, ...tseslint.configs.recommended, ...flatConfig];
