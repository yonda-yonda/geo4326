module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    'jest/globals': true
  },
  plugins: ["@typescript-eslint", "jest"],
  extends: [
    "eslint:recommended"
  ],
  rules: {},
  overrides: [{
    files: ['**/*.ts'],
    extends: [
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      createDefaultProgram: true,
      project: "./tsconfig.json",
    },
    plugins: ['@typescript-eslint'],
    rules: {}
  }]
};