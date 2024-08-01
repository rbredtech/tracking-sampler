import stylisticJs from '@stylistic/eslint-plugin-js';
import html from 'eslint-plugin-html';

export default [
  {
    files: ['src/**.js'],
    languageOptions: {
      ecmaVersion: 3,
      sourceType: 'script'
    },
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single']
    }
  },
  {
    files: ['src/*.html'],
    plugins: { html },
  },
];
