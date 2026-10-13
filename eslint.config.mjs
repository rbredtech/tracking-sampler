import js from "@eslint/js";
import hbbtvCompat from "eslint-plugin-hbbtv-compat";
import prettier from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";
import globals from "globals";

// Defined by the sampler itself: on `window` (ponyfills, sampler.js, the iframe
// pages) or as functions of partials pulled in through the ejs `include`.
const projectGlobals = [
  "__ejs",
  "__tvi_sampler",
  "_sendMessage",
  "jsonParse",
  "jsonStringify",
  "isIframeCapable",
  "loadOnDOMContentLoaded",
  "waitForDOMElement",
  "readStorage",
  "writeStorage",
  "deleteStorage",
];

const noUnsupportedJs = [
  "error",
  {
    additionalSupportedGlobals: projectGlobals,
  },
];

export default defineConfig([
  {
    files: ["src/**/*.js", "src/**/*.html", "test/**/*.html"],
    languageOptions: {
      ecmaVersion: 3,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.builtin,
        ...Object.fromEntries(projectGlobals.map((name) => [name, "readonly"])),
      },
    },
    plugins: {
      js,
      "hbbtv-compat": hbbtvCompat,
    },
    extends: ["js/recommended"],
    rules: {
      "prettier/prettier": "error",
      "hbbtv-compat/no-unsupported-js": noUnsupportedJs,
      "hbbtv-compat/no-unsupported-css": "error",
      "hbbtv-compat/no-post-es3-syntax": "error",
      "no-empty": "off",
      "no-unused-vars": "off",
      "no-constant-condition": "off",
      // The partials that declare projectGlobals would otherwise be reported.
      "no-redeclare": ["error", { builtinGlobals: false }],
    },
  },
  {
    files: ["src/**/*.html", "test/**/*.html"],
    plugins: { "hbbtv-compat": hbbtvCompat },
    processor: "hbbtv-compat/html",
    rules: {
      "hbbtv-compat/no-unsupported-js": noUnsupportedJs,
      "hbbtv-compat/no-unsupported-css": "error",
      "hbbtv-compat/no-post-es3-syntax": "error",
    },
  },
  {
    files: ["eslint.config.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["gulpfile.mjs"],
    languageOptions: {
      sourceType: "module",
    },
  },
  prettier,
  // After `prettier`, because eslint-config-prettier disables `curly` and would
  // otherwise silently zero the copy that styleOpinions sets.
  {
    files: ["src/**/*.js", "src/**/*.html", "test/**/*.html"],
    extends: [hbbtvCompat.configs.legacyRuntime, hbbtvCompat.configs.styleOpinions],
  },
  // Also after `prettier`: the HTML processor hands the rules a block stripped of
  // its surrounding document, and prettier/prettier would reformat that fragment
  // into a shape that does not fit back in. Formatting HTML is the prettier CLI's job.
  {
    files: ["src/**/*.html", "test/**/*.html"],
    rules: { "prettier/prettier": "off" },
  },
]);
