const { version } = require('process')

const isNode8 = version.startsWith('v8.')

module.exports = {
  plugins: ['prettier', 'fp', 'markdown', 'html'],
  extends: [
    // This version of eslint-plugin-unicorn requires Node 10
    // TODO: remove after dropping Node 8 support
    ...(isNode8 ? [] : ['plugin:unicorn/recommended']),

    'eslint:recommended',
    'standard',
    'prettier',
    'prettier/standard',
    'plugin:eslint-comments/recommended',
    'plugin:fp/recommended',
    'plugin:ava/recommended',
    'plugin:you-dont-need-lodash-underscore/all',
  ],
  reportUnusedDisableDirectives: true,
  rules: {
    'no-console': 0,
    'no-unused-vars': [2, {}],
    'no-empty': [2, { allowEmptyCatch: true }],
    'import/order': [
      2,
      {
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'no-process-exit': 0,
    'require-atomic-updates': 0,
    'no-undef': [2, { typeof: true }],

    'max-lines': [
      2,
      {
        max: 150,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-lines-per-function': [
      2,
      {
        max: 100,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: true,
      },
    ],
    'max-statements': [2, 15],
    'max-statements-per-line': [2, { max: 2 }],
    'import/max-dependencies': [2, { max: 20 }],
    complexity: [2, 5],
    'max-depth': [2, 2],
    'max-nested-callbacks': [2, 2],
    'require-await': 2,

    'node/global-require': 2,
    'node/no-mixed-requires': 2,
    'node/prefer-global/process': [2, 'never'],

    'eslint-comments/no-unused-disable': 0,
    'eslint-comments/no-use': [
      2,
      { allow: ['eslint-disable-next-line', 'eslint-disable', 'eslint-enable', 'eslint-env'] },
    ],

    // This version of eslint-plugin-unicorn requires Node 10
    // TODO: remove after dropping Node 8 support
    ...(isNode8
      ? {}
      : {
          // Not enabled by default in unicorn/recommended, but still pretty useful
          'unicorn/custom-error-definition': 2,
          'unicorn/no-unused-properties': 2,
          // The additional `non-zero` option is useful for code consistency
          'unicorn/explicit-length-check': [2, { 'non-zero': 'not-equal' }],
          // TODO: harmonize with filename snake_case in other Netlify Dev projects
          'unicorn/filename-case': [2, { case: 'snakeCase', ignore: ['.*.md'] }],
          // The `sortCharacterClasses` option is not very useful
          'unicorn/better-regex': [2, { sortCharacterClasses: false }],
          // Too strict
          'unicorn/no-null': 0,
          'unicorn/no-reduce': 0,
          // This rule gives too many false positives
          'unicorn/prevent-abbreviations': 0,
          // Conflicts with Prettier sometimes
          'unicorn/number-literal-case': 0,
          // Conflicts with the core ESLint `prefer-destructuring` rule
          'unicorn/no-unreadable-array-destructuring': 0,
          // Not useful for us
          'unicorn/expiring-todo-comments': 0,
          'unicorn/no-fn-reference-in-iterator': 0,
          // TODO: enable those rules
          'unicorn/no-process-exit': 0,
          'unicorn/import-style': 0,
          // TODO: enable after dropping Node 8 support
          'unicorn/prefer-optional-catch-binding': 0,
          'unicorn/prefer-trim-start-end': 0,
        }),

    'fp/no-rest-parameters': 0,
    'fp/no-unused-expression': 0,
    'fp/no-nil': 0,
    'fp/no-throw': 0,
    'fp/no-mutating-methods': [
      2,
      { allowedObjects: ['error', 'errorA', 'res', 'state', 'runState', 'logs', 'logsArray', 'currentEnv'] },
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

    'ava/no-ignored-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],
    'ava/no-import-test-files': [2, { files: ['tests/**/*.js', '!tests/{helpers,fixtures}/**/*.{js,json}'] }],
    'ava/no-skip-test': 0,
  },
  overrides: [
    {
      files: ['**/tests.js', '**/tests/**/*.js'],
      rules: {
        'max-lines': 0,
        'node/no-unpublished-require': 0,
        'node/no-missing-require': 0,
        'unicorn/no-process-exit': 0,
        'fp/no-mutating-methods': 0,
        'fp/no-mutation': 0,
        'fp/no-delete': 0,
      },
    },
    {
      files: ['**/*.md'],
      rules: {
        'no-undef': 0,
        'no-unused-vars': 0,
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
