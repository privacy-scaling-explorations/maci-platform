const fs = require("fs");
const path = require("path");

const prettierConfig = fs.readFileSync(path.resolve(__dirname, "../../.prettierrc"), "utf8");
const prettierOptions = JSON.parse(prettierConfig);
const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  root: true,
  extends: ["../../.eslintrc.js", "plugin:react/recommended"],
  plugins: ["json", "prettier", "unused-imports", "import", "@typescript-eslint", "react-hooks"],
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    node: true,
    jest: true,
    es2022: true,
  },
  settings: {
    react: {
      version: "18",
    },
    "import/resolver": {
      typescript: {
        project: path.resolve(__dirname, "./tsconfig.json"),
      },
      node: {
        extensions: [".ts", ".js", ".tsx", ".jsx"],
        moduleDirectory: ["node_modules", "src"],
      },
    },
  },
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
  reportUnusedDisableDirectives: isProduction,
  rules: {
    "import/no-cycle": ["error"],
    "unused-imports/no-unused-imports": "error",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/*.test.ts",
          "**/*.setup.ts",
          "./src/test-setup.ts",
          "./src/lib/eas/*.ts",
          "./vitest.config.ts",
        ],
      },
    ],
    "no-debugger": isProduction ? "error" : "off",
    "no-console": "error",
    "no-underscore-dangle": "error",
    "no-redeclare": ["error", { builtinGlobals: true }],
    "import/order": [
      "error",
      {
        groups: ["external", "builtin", "internal", "type", "parent", "sibling", "index", "object"],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        warnOnUnassignedImports: true,
        "newlines-between": "always",
      },
    ],
    "prettier/prettier": ["error", prettierOptions],
    "import/prefer-default-export": "off",
    "import/extensions": ["error", { json: "always" }],
    "class-methods-use-this": "off",
    "prefer-promise-reject-errors": "off",
    "max-classes-per-file": "off",
    "no-use-before-define": ["off"],
    "no-shadow": "off",
    curly: ["error", "all"],

    "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "no-public" }],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-use-before-define": ["error", { functions: false, classes: false }],
    "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
    "@typescript-eslint/no-shadow": [
      "error",
      {
        builtinGlobals: true,
        allow: [
          "alert",
          "location",
          "event",
          "history",
          "name",
          "status",
          "Option",
          "Image",
          "Lock",
          "test",
          "expect",
          "describe",
          "beforeAll",
          "afterAll",
        ],
      },
    ],
    "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],

    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".tsx", ".jsx", ".js"],
      },
    ],
    "react/no-unknown-property": ["error", { ignore: ["tw", "global", "jsx"] }],
    "react/jsx-sort-props": [
      "error",
      {
        callbacksLast: true,
        shorthandFirst: true,
        ignoreCase: true,
        reservedFirst: true,
      },
    ],
    "react/sort-prop-types": [
      "error",
      {
        callbacksLast: true,
      },
    ],
    "react/react-in-jsx-scope": "off",
    "react/jsx-boolean-value": "error",
    "react/jsx-handler-names": "error",
    "react/prop-types": "error",
    "react/jsx-no-bind": "error",
    "react-hooks/rules-of-hooks": "error",
    "react/no-array-index-key": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    "react/jsx-props-no-spreading": "off",
    "react/forbid-prop-types": "off",
    "react/state-in-constructor": "off",
    "react/jsx-fragments": "off",
    "react/static-property-placement": ["off"],
    "react/jsx-newline": ["error", { prevent: false }],
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/label-has-for": "off",
    "react/require-default-props": [
      "warn",
      {
        functions: "defaultArguments",
      },
    ],
    "react/no-unused-prop-types": "error",
    "react/function-component-definition": ["error", { namedComponents: ["arrow-function"] }],
  },
};
