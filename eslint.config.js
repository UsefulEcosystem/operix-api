import tseslint from 'typescript-eslint';

export default tseslint.config([
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    extends: [...tseslint.configs.recommended],
    rules: {
      indent: ['error', 2],
      'linebreak-style': 'off',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['src/modules/**/*.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      quotes: 'off',
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      quotes: 'off',
    },
  },
]);
