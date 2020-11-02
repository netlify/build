'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: [
    '@netlify/eslint-config-node',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:fp/recommended',
  ],
  parserOptions: {
    sourceType: 'script',
  },
  rules: {
    strict: 2,

    // eslint-plugin-ava needs to know where test files are located
    'ava/no-ignored-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],
    'ava/no-import-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],

    'promise/no-callback-in-promise': 2,
    'promise/no-nesting': 2,
    'promise/no-promise-in-callback': 2,
    'promise/no-return-in-finally': 2,
    'promise/prefer-await-to-callbacks': 2,
    'promise/prefer-await-to-then': 2,
    'promise/valid-params': 2,

    // Those rules are too strict
    'fp/no-rest-parameters': 0,
    'fp/no-unused-expression': 0,
    'fp/no-nil': 0,
    'fp/no-throw': 0,

    'import/extensions': [2, 'always', { ignorePackages: true }],
    'import/newline-after-import': 2,
    'import/no-amd': 2,
    'import/no-anonymous-default-export': 2,
    'import/no-cycle': [2, { commonjs: true }],
    'import/no-deprecated': 2,
    'import/no-dynamic-require': 2,
    'import/no-extraneous-dependencies': 2,
    'import/no-mutable-exports': 2,
    'import/no-named-default': 2,
    'import/no-namespace': 2,
    'import/no-self-import': 2,
    'import/no-unassigned-import': [2, { allow: ['*polyfill*', '**/*polyfill*', 'log-process-errors/**'] }],
    'import/no-unresolved': [2, { commonjs: true }],
    'import/no-useless-path-segments': [2, { commonjs: true }],
  },
  overrides: [
    ...overrides,
    {
      files: ['**/*.md'],
      rules: {
        strict: 0,
        'import/no-unresolved': 0,
      },
    },
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
  ],
}
