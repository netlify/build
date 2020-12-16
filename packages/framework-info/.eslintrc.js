const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  overrides: [
    ...overrides,
    {
      files: ['*.jsx'],
      extends: ['eslint:recommended', 'plugin:react/recommended'],
    },
  ],
}
