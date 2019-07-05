module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: `2019`,
  },
  extends: [
    `@avalanche/eslint-config`,
  ],
  rules: {
    'no-await-in-loop': 0,
    'no-continue': 0,
    'no-restricted-syntax': 0,
  },
};
