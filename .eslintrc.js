module.exports = {
  extends: ["eslint:recommended"],
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  ignorePatterns: ["dist/", "node_modules/", "build/", "**/*.ts", "**/*.tsx"],
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
  },
};
