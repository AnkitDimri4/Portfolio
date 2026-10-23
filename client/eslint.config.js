import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["build", "build-ssr"] },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // The browser's own alert(), confirm() and prompt() boxes: the site asks in its own dialog (src/builder/Ask.jsx)
      "no-alert": "error",
    },
  },
  {
    files: ["scripts/**", "api/**", "*.config.js"],
    languageOptions: { globals: globals.node },
  },
];
