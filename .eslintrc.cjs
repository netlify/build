// eslint-disable-next-line  @typescript-eslint/no-var-requires
// const { builtinModules } = require('module')

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
  plugins: ['import', '@typescript-eslint'],
  ignorePatterns: ['dist/**', 'node_modules/**', '**/*.md'],
  overrides: [
    {
      files: ['packages/*/tests/**'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': ['off'],
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-absolute-path': ['error'],
    'import/no-cycle': ['error', { ignoreExternal: true }],
    'import/no-duplicates': ['error', { considerQueryString: true }],
    'import/no-self-import': ['error'],
    'import/no-mutable-exports': ['error'],
    'import/no-useless-path-segments': ['error'],
    // 'import/order': [
    //   'error',
    //   {
    //     pathGroups: [
    //       {
    //         pattern: 'node:*',
    //         group: 'builtin',
    //         position: 'before',
    //       },
    //     ],
    //     pathGroupsExcludedImportTypes: ['builtin'],
    //     'newlines-between': 'never',
    //     alphabetize: {
    //       order: 'asc',
    //       caseInsensitive: true,
    //     },
    //   },
    // ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          // ...builtinModules.map((name) => ({
          //   name,
          //   message: `Please use import from 'node:${name}' instead.`,
          // })),
          {
            name: '.', // avoid importing from the same barrel file and introducing a circular dependency
            message: 'Importing from `.` is not allowed!',
          },
        ],
      },
    ],
  },
}

module.exports = config
