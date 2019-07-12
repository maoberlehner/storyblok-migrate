module.exports = {
  plugins: [`markdown`],
  extends: `.eslintrc.js`,
  rules: {
    'no-param-reassign': `off`,
    quotes: [2, `single`, { avoidEscape: true }],
    'import/no-extraneous-dependencies': `off`,
    'import/no-unresolved': `off`,
  },
};
