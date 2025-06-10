/** @type {import('eslint').Linter.Config} */
const config = {
  env: {
    es2021: true,
    node: true,
  },
  settings: {
    'import/extensions': ['.js'],
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['import', '@typescript-eslint', 'ava', '@vitest'],

  ignorePatterns: [
    // TODO: remove when they are migrated to typescript
    'packages/build/test-d/**',
    'packages/build/types/**',
    // don't lint fixtures
    'packages/*/tests/**/fixtures*/**',
    'packages/*/benchmarks/**/fixtures*/**',
    'packages/*/lib/**',
    'packages/*/dist/**',

    'packages/edge-bundler/deno/**/*',
    'packages/edge-bundler/node/vendor/**',
    'packages/edge-bundler/test/deno/**/*',
    'packages/edge-bundler/test/fixtures/**/*',
  ],
  rules: {
    // -----------------------------------------------------------
    // General rules
    strict: 'error',

    // -----------------------------------------------------------
    // Typescript rules
    '@typescript-eslint/no-explicit-any': ['off'],

    // -----------------------------------------------------------
    // Import rules
    'import/extensions': ['error', 'ignorePackages'], // This requires for esm modules .js file extensions on relative paths
    'import/no-absolute-path': ['error'],
    'import/no-cycle': ['error', { ignoreExternal: true }],
    'import/no-duplicates': ['error', { considerQueryString: true }],
    'import/no-self-import': ['error'],
    'import/no-mutable-exports': ['error'],
    'import/no-useless-path-segments': ['error'],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // -----------------------------------------------------------
    // Test rules
    'ava/no-only-test': 'error',
    // 'ava/no-skip-test': 'error', // Uncomment once we remove all skipped tests
    // 'vitest/no-commented-out-tests': 'error', // Uncomment once we remove all commented out tests
    '@vitest/no-disabled-tests': 'error',
    '@vitest/no-focused-tests': 'error',
  },
  overrides: [
    {
      files: ['packages/*/tests/**'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
    {
      files: ['packages/zip-it-and-ship-it/tests/**'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
}

module.exports = config
