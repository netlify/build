'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  rules: {
    strict: 2,

    // Fails with npm 7 monorepos due to the following bug:
    // https://github.com/benmosher/eslint-plugin-import/issues/1986
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'node/no-missing-require': 0,

    // eslint-plugin-ava needs to know where test files are located
    'ava/no-ignored-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],
    'ava/no-import-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],
  },
  overrides: [
    ...overrides,
    {
      files: ['**/fixtures/**/*.js'],
      rules: {
        'import/no-unresolved': 0,
      },
    },
    {
      files: ['**/fixtures/handlers_*/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'node/no-unsupported-features/es-syntax': 0,
      },
    },

    // @todo As it stands, this rule is problematic with methods that get+send
    // many parameters, such as `runCommand` in `src/commands/run_command.js`.
    // We should discuss whether we want to keep this rule or discontinue it.
    {
      files: ['packages/build/**/*.js'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
  ],
}
