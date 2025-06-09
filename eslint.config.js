// @ts-check
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
import eslint from '@eslint/js'
import node from 'eslint-plugin-n'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'

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
  {
    rules: {
      'n/no-unpublished-import': 'off',
      'n/no-unpublished-require': 'off',
    },
  },

  // Project-specific rules
  {
    ignores: ['packages/**/dist'],
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
    },
  },

  // Tests
  {
    ignores: ['packages/**/fixtures', 'packages/**/fixtures-esm'],
  },
  {
    files: ['**/*.test.?(c|m)[jt]s?(x)', '**/test/*'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,

      'vitest/no-disabled-tests': ['error'],
      'vitest/no-focused-tests': ['error'],
      'vitest/no-commented-out-tests': ['error'],
    },
  },

  ...temporarySuppressions,

  // Must be last
  prettier,
)
