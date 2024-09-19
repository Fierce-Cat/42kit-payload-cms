module.exports = {
  extends: ['@payloadcms'],
  overrides: [
    {
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      files: ['*.js', '*.cjs', '*.json', '*.md', '*.yml', '*.yaml'],
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
        'perfectionist/sort-array-includes': 'true',
        'perfectionist/sort-astro-attributes': 'true',
        'perfectionist/sort-classes': 'off',
        'perfectionist/sort-enums': 'off',
        'perfectionist/sort-exports': 'off',
        'perfectionist/sort-imports': 'off',
        'perfectionist/sort-interfaces': 'off',
        'perfectionist/sort-jsx-props': 'off',
        'perfectionist/sort-keys': 'off',
        'perfectionist/sort-maps': 'off',
        'perfectionist/sort-named-exports': 'true',
        'perfectionist/sort-named-imports': 'true',
        'perfectionist/sort-object-types': 'off',
        'perfectionist/sort-objects': 'off',
        'perfectionist/sort-svelte-attributes': 'off',
        'perfectionist/sort-union-types': 'off',
        'perfectionist/sort-vue-attributes': 'off',
      },
    },
  ],
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
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
};
