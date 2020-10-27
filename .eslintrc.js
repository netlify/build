const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  plugins: ['fp'],
  extends: ['@netlify/eslint-config-node', 'plugin:node/recommended', 'plugin:fp/recommended'],
  rules: {
    // Those ESLint rules are not enabled by Prettier, ESLint recommended rules
    // nor standard JavaScript. However, they are still useful
    'class-methods-use-this': 2,
    complexity: [2, 5],
    'max-depth': [2, 2],
    'max-lines': [2, { max: 150, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': [2, { max: 100, skipBlankLines: true, skipComments: true, IIFEs: true }],
    'max-nested-callbacks': [2, 2],
    'max-statements': [2, 15],
    'max-statements-per-line': [2, { max: 2 }],
    'no-empty': [2, { allowEmptyCatch: true }],
    'no-param-reassign': [
      2,
      {
        props: true,
        ignorePropertyModificationsFor: [
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

    // TODO: enable those rules
    // strict: 2,

    'ava/no-ignored-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],
    'ava/no-import-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],

    'fp/no-rest-parameters': 0,
    'fp/no-unused-expression': 0,
    'fp/no-nil': 0,
    'fp/no-throw': 0,
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

    'import/max-dependencies': [2, { max: 20 }],

    'node/no-sync': 2,
    'node/handle-callback-err': 2,
    'node/no-new-require': 2,
    'node/callback-return': 2,
    'node/exports-style': 2,
    'node/file-extension-in-import': 2,
    'node/global-require': 2,
    'node/no-mixed-requires': 2,
    // Browser globals should not use `require()`. Non-browser globals should
    'node/prefer-global/console': 2,
    'node/prefer-global/buffer': [2, 'never'],
    'node/prefer-global/process': [2, 'never'],
    // TODO: enable after dropping support for Node <10.0.0
    'node/prefer-global/url-search-params': 0,
    'node/prefer-global/url': 0,
    // TODO: enable after dropping support for Node <11.0.0
    'node/prefer-global/text-decoder': 0,
    'node/prefer-global/text-encoder': 0,
    // TODO: enable after dropping support for Node <11.4.0
    'node/prefer-promises/fs': 0,
    'node/prefer-promises/dns': 0,
    // This does not work well in a monorepo
    'node/shebang': 0,
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
