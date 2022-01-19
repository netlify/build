const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'import/extensions': [2, 'ignorePackages'],
    'import/no-unresolved': [2, { ignore: ['build/'] }],
  },
  overrides: [...overrides],
}
