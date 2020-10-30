const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: ['@netlify/eslint-config-node', 'plugin:fp/recommended'],
  parserOptions: {
    sourceType: 'script',
  },
  rules: {
    strict: 2,

    // eslint-plugin-ava needs to know where test files are located
    'ava/no-ignored-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],
    'ava/no-import-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],

    // Those rules are too strict
    'fp/no-rest-parameters': 0,
    'fp/no-unused-expression': 0,
    'fp/no-nil': 0,
    'fp/no-throw': 0,
  },
  overrides: [
    ...overrides,
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
