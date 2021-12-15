'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: ['plugin:fp/recommended', '@netlify/eslint-config-node'],
  rules: {
    strict: 2,

    // eslint-plugin-ava needs to know where test files are located
    'ava/no-ignored-test-files': [
      2,
      { files: ['tests/**/*.{cjs,mjs,js}', '!tests/{helpers,fixtures}/**/*.{cjs,mjs,js,json}'] },
    ],
    'ava/no-import-test-files': [
      2,
      { files: ['tests/**/*.{cjs,mjs,js}', '!tests/{helpers,fixtures}/**/*.{cjs,mjs,js,json}'] },
    ],

    // Avoid state mutation except for some known state variables
    'fp/no-mutating-methods': [
      2,
      {
        allowedObjects: [
          'error',
          'errorA',
          'req',
          'request',
          'res',
          'response',
          'state',
          'runState',
          'logs',
          'logsArray',
          'currentEnv',
          't',
        ],
      },
    ],
    'fp/no-mutation': [
      2,
      {
        commonjs: true,
        exceptions: [
          { object: 'error' },
          { object: 'errorA' },
          { object: 'res' },
          { object: 'state' },
          { object: 'runState' },
          { object: 'logs' },
          { object: 'logsArray' },
          { object: 'currentEnv' },
          { object: 'process', property: 'exitCode' },
        ],
      },
    ],
  },
  overrides: [
    ...overrides,
    {
      files: ['**/fixtures/**/*.{cjs,mjs,js}'],
      rules: {
        'import/no-unresolved': 0,
      },
    },
    {
      files: ['**/fixtures/**/*edge-handlers*/**/*.js', '**/fixtures/*es_module*/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'node/no-unsupported-features/es-syntax': 0,
        'ava/no-import-test-files': 0,
      },
    },

    // @todo As it stands, this rule is problematic with methods that get+send
    // many parameters, such as `runStep` in `src/steps/run_step.js`.
    // We should discuss whether we want to keep this rule or discontinue it.
    {
      files: ['packages/build/**/*.{cjs,mjs,js}'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['**/test-d/**/*.ts'],
      rules: {
        // We use `tsd` which sometimes require declaring variables without
        // using them
        '@typescript-eslint/no-unused-vars': 0,
        // Allow self-imports
        'node/no-extraneous-import': 0,
      },
    },
    {
      files: ['packages/*/tests/**/*.{cjs,mjs,js}'],
      rules: {
        'no-magic-numbers': 'off',
      },
    },

    // Those packages are using pure ES modules
    {
      files: [
        'packages/git-utils/**/*.{cjs,mjs,js}',
        'packages/functions-utils/**/*.{cjs,mjs,js}',
        'packages/run-utils/**/*.{cjs,mjs,js}',
      ],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'import/extensions': [2, 'ignorePackages'],
      },
    },
  ],
}
