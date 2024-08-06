import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import html from "eslint-plugin-html";

export default [
  eslintPluginPrettierRecommended,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 3,
      sourceType: "script",
    },
  },
  {
    files: ["eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    files: ["gulpfile.js"],
    languageOptions: {
      ecmaVersion: 6,
      sourceType: "commonjs",
    },
  },
  {
    files: ["src/**/*.html", "test/**/*.html"],
    plugins: { html },
  },
];
