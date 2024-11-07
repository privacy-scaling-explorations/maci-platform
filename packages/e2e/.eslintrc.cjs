const path = require("path");

module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: ["../../.eslintrc.js", "plugin:playwright/playwright-test"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: path.resolve(__dirname, "./tsconfig.json"),
    sourceType: "module",
    typescript: true,
    ecmaVersion: 2022,
    experimentalDecorators: true,
    requireConfigFile: false,
    ecmaFeatures: {
      classes: true,
      impliedStrict: true,
    },
    warnOnUnsupportedTypeScriptVersion: true,
  },
  overrides: [
    {
      files: ["./test/*.ts"],
      rules: {
        "playwright/prefer-lowercase-title": "error",
        "playwright/prefer-to-be": "error",
        "playwright/prefer-to-have-length": "error",
        "playwright/prefer-strict-equal": "error",
        "playwright/max-nested-describe": ["error", { max: 1 }],
        "playwright/no-restricted-matchers": [
          "error",
          {
            toBeFalsy: "Use `toBe(false)` instead.",
            not: null,
          },
        ],
      },
    },
  ],
};
