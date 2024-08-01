import stylisticJs from '@stylistic/eslint-plugin-js'

export default [
  {
    languageOptions: {
      ecmaVersion: 3,
      sourceType: "script"
    },
    ignores: ["dist/*"],
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      quotes: ["error", "single"]
    }
  }
];
