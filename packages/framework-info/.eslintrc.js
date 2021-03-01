const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  overrides: [
    ...overrides,
    {
      files: ['*.jsx'],
      extends: '@netlify/eslint-config-node/react_config',
    },
    {
      files: ['*.html'],
      extends: '@netlify/eslint-config-node/vanilla_js_config',
      overrides: [{ files: ['site/vanilla/index.html'], globals: { frameworkInfo: 'readonly' } }],
    },
    {
      files: ['cypress/**/*.js'],
      parserOptions: {
        sourceType: 'module',
      },
      env: {
        'cypress/globals': true,
      },
      plugins: ['cypress'],
    },
  ],
}
