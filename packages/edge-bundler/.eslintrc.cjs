'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  ignorePatterns: ['deno/**/*.ts'],
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'node/no-missing-import': 'off',
  },
  overrides: [...overrides],
}
