/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': [2, { args: 'all', argsIgnorePattern: '^_' }],
    'no-unused-labels': 'error',
    'no-unused-expressions': 'error'
  }
}
