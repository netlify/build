// @ts-check
/* eslint-disable import-x/no-named-as-default-member */
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import { includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import ava from 'eslint-plugin-ava'
import importPlugin from 'eslint-plugin-import-x'
import node from 'eslint-plugin-n'
import tseslint from 'typescript-eslint'

import temporarySuppressions from './eslint_temporary_suppressions.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default tseslint.config(
  // Global rules and configuration
  includeIgnoreFile(path.resolve(__dirname, '.gitignore')),
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // JavaScript-specific rules
  eslint.configs.recommended,

  // Typescript-specific rules
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.base.json', './packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },

  {
    files: ['**/*.?(c|m)js?(x)'],
    ...tseslint.configs.disableTypeChecked,
  },
  node.configs['flat/recommended'],

  // Import rules

  importPlugin.flatConfigs?.recommended,
  importPlugin.flatConfigs?.typescript,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'import-x/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          ts: 'never',
        },
      ], // This requires for esm modules .js file extensions on relative paths
      'import-x/no-absolute-path': ['error'],
      'import-x/no-cycle': ['error', { ignoreExternal: true }],
      'import-x/no-duplicates': ['error', { considerQueryString: true }],
      'import-x/no-mutable-exports': ['error'],
      'import-x/no-self-import': ['error'],
      'import-x/no-useless-path-segments': ['error'],
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },

  // Project-specific rules
  {
    ignores: ['packages/**/dist', 'packages/**/lib', 'packages/edge-bundler/deno/**'],
  },
  {
    files: ['**/*.?(c|m)ts?(x)'],
    rules: {
      // Ignore underscore-prefixed unused variables (mirrors tsc behavior)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],

      // Empty functions and blocks are useful (e.g `noop() {}`, `catch {}`) but can mask unintentionally omitted
      // implementation. We should add explanatory comments like `// intentionally empty` and `// ignore error` in these
      // scenarios to communicate intent.
      'no-empty': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // `@typescript-eslint/non-nullable-type-assertion-style` prohibits type assertions
      // and pushes people to use the non-null assertion operator. Except that is also not
      // allowed, giving us no option to mark something as non-nullable. Disabling the
      // latter to make this possible.
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Tests
  {
    ignores: ['packages/**/fixtures', 'packages/**/fixtures-esm'],
  },
  {
    files: ['**/*.test.?(c|m)[jt]s?(x)'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,

      'vitest/no-disabled-tests': ['error'],
      'vitest/no-focused-tests': ['error'],
      'vitest/no-commented-out-tests': ['error'],
    },
  },
  {
    files: ['**/tests.js', '**/*.tests.js'],
    plugins: { ava },
    rules: {
      'ava/no-only-test': 'error',
    },
  },

  temporarySuppressions,
)
