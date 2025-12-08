import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      "eol-last": ["error", "always"],
    },
  },
  {
    files: ["migrations/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "eol-last": ["error", "always"],
    },
  },
];
