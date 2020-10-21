/* eslint-disable max-lines */
module.exports = {
  plugins: ['prettier', 'fp', 'markdown', 'html'],
  extends: [
    'eslint:recommended',
    'standard',
    'prettier',
    'prettier/standard',
    'plugin:eslint-comments/recommended',
    'plugin:unicorn/recommended',
    'plugin:node/recommended',
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

    // Those ESLint rules are not enabled by Prettier, ESLint recommended rules
    // nor standard JavaScript. However, they are still useful
    'default-param-last': 2,
    'func-names': [2, 'as-needed'],
    'func-style': 2,
    'multiline-comment-style': [2, 'separate-lines'],
    'no-await-in-loop': 2,

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
    'node/prefer-global/url-search-params': 2,
    'node/prefer-global/text-decoder': 2,
    'node/prefer-global/text-encoder': 2,
    'node/prefer-global/url': 2,
    'node/prefer-global/buffer': [2, 'never'],
    'node/prefer-global/process': [2, 'never'],
    // TODO: enable after dropping support for Node <11.4.0
    'node/prefer-promises/fs': 2,
    'node/prefer-promises/dns': 2,
    // This does not work well in a monorepo
    'node/shebang': 0,

    'eslint-comments/no-unused-disable': 0,
    'eslint-comments/no-use': [
      2,
      { allow: ['eslint-disable-next-line', 'eslint-disable', 'eslint-enable', 'eslint-env'] },
    ],

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
    // The autofix makes it impossible to use those in debugging
    'ava/no-skip-test': 0,
    'ava/no-only-test': 0,
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
      files: ['scripts/**/*.js'],
      rules: {
        'node/no-unpublished-require': 0,
      },
    },
    {
      files: ['**/*.md'],
      rules: {
        'no-undef': 0,
        'no-unused-vars': 0,
        'node/no-missing-require': 0,
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
/* eslint-enable max-lines */
