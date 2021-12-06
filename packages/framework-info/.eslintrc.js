const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  rules: {
    'import/no-unresolved': [2, { ignore: ['build/'] }],
  },
  overrides: [...overrides],
}
