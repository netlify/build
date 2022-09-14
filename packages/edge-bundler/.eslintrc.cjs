'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  ignorePatterns: ['deno/**/*.ts', 'test/deno/**/*.ts'],
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    complexity: 'off',
    'max-lines': 'off',
    'max-statements': 'off',
    'node/no-missing-import': 'off',
  },
  overrides: [
    ...overrides,
    {
      files: ['test/node/**/*.ts'],
      rules: {
        'max-statements': 'off',
        'no-magic-numbers': 'off',
      },
    },
  ],
}
