import html from "eslint-plugin-html";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

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
    files: ["gulpfile.mjs"],
    languageOptions: {
      sourceType: "module",
    },
  },
  {
    files: ["src/**/*.html", "test/**/*.html"],
    plugins: { html },
  },
];
