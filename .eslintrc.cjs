module.exports = {
  extends: ['plugin:fp/recommended', '@netlify/eslint-config-node/.eslintrc_esm.cjs'],
  env: {
    es2021: true,
    node: true,
  },
  settings: {
    'import/extensions': ['.js'],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['import', '@typescript-eslint'],
  rules: {
    strict: 2,
    'max-lines': 'off',
    // eslint-plugin-ava needs to know where test files are located
    'ava/no-ignored-test-files': [
      2,
      { files: ['tests/**/*.{cjs,mjs,js}', '!tests/{helpers,fixtures}/**/*.{cjs,mjs,js,json}'] },
    ],
    'ava/no-import-test-files': [
      2,
      { files: ['tests/**/*.{cjs,mjs,js}', '!tests/{helpers,fixtures}/**/*.{cjs,mjs,js,json}'] },
    ],

    // `eslint-plugin-node` seems to have a bug finding `chalk`
    // 'n/no-missing-import': [2, { allowModules: ['chalk'] }],
    'n/no-missing-import': 'off',
    'import/no-unresolved': 'off',
    'n/no-unpublished-require': 'off',
    'n/no-missing-require': 'off',
    'unicorn/no-process-exit': 'off',
    'fp/no-mutating-methods': 'off',
    'no-param-reassign': 'off',
    'fp/no-mutation': 'off',
    'fp/no-delete': 'off',
  },
  overrides: [
    // ...overrides,
    {
      files: ['**/fixtures/**/*.{cjs,mjs,js}'],
      rules: {
        'import/no-unresolved': 0,
        'n/no-missing-import': 0,
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
        'n/no-extraneous-import': 0,
      },
    },
    {
      // **/*.md/*.js references code blocks inside markdown files
      files: ['**/*.md/*.js'],
      rules: {
        // Allow self-imports
        'n/no-extraneous-import': 0,
      },
    },
    // `@netlify/config` currently imports some test helpers from
    // `@netlify/build`.
    // This is creating linting issues, but only on Windows for some reason.
    {
      files: ['packages/config/tests/helpers/main.js'],
      rules: {
        'import/named': 0,
      },
    },
    // TODO: remove once we use named exports in test fixtures
    {
      files: ['packages/build/tests/**/fixtures/**/*.{mjs,js}'],
      rules: {
        'import/no-anonymous-default-export': 0,
      },
    },
    // Disabling certain rules for test files.
    {
      files: ['packages/build/tests/**/*.{mjs,js}'],
      rules: {
        'import/no-named-as-default-member': 'off',
        'max-statements': 'off',
        'no-magic-numbers': 'off',
      },
    },
    {
      files: ['packages/*/tests/**/*.{mjs,js}'],
      rules: {
        // @netlify/testing is a private package and therefore hoisted to the root without the need to ad it to devDependencies
        'import/no-extraneous-dependencies': 'off',
        'n/no-extraneous-import': 'off',
        'import/no-unresolved': 'off',
        'n/no-missing-import': 'off',
      },
    },
    {
      files: ['**/*.ts'],
      rules: {
        'import/no-absolute-path': ['error'],
        'import/no-cycle': ['error', { ignoreExternal: true }],
        'import/no-duplicates': ['error', { considerQueryString: true }],
        'import/no-self-import': ['error'],
        'import/no-mutable-exports': ['error'],
        'import/no-useless-path-segments': ['error'],
        'n/no-missing-import': 'off',
        'fp/no-this': 'off',
        'fp/no-mutation': 'off',
        'fp/no-class': 'off',
        'fp/no-mutating-methods': 'off',
        // this is some weird override as the base rules are doing strange stuff should be: 'import/extensions': ['error', 'ignorePackages'],
        'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
      },
    },
  ],
}
