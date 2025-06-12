// @ts-check
/*
 * XXX: Temporary suppressions
 *
 * These rules are suppressed because we haven't yet fixed offending code.
 *
 * Want to help? Remove the suppression, fix any lint errors, and submit a PR.
 */

/** @type { import("eslint").Linter.Config[] } */
export default [
  /* Global rule suppressions */

  {
    rules: {
      // Projects are currently making use of both `interface` and `type`
      '@typescript-eslint/consistent-type-definitions': 'off',

      // The Fetch API was technically marked stable in node 21
      'n/no-unsupported-features/node-builtins': [
        'error',
        {
          ignores: ['FormData', 'Headers', 'ReadableStream', 'Response', 'Request', 'fetch'],
        },
      ],

      // Silencing false positives
      'import/no-unresolved': ['off'],
    },
  },
  {
    // Allow circular testing package dependency in build and config
    files: ['packages/build/tests/**/tests.js', 'packages/config/tests/**/tests.js'],
    rules: {
      'n/no-extraneous-import': 'off',
    },
  },

  /* Per-file rule suppressions */

  {
    files: ['commitlint.config.cjs'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['packages/build-info/src/browser/file-system.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build-info/src/browser/file-system.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/build-info/src/build-systems/build-system.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/build-info/src/build-systems/nx.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['packages/build-info/src/build-systems/package-managers.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['packages/build-info/src/events.test.ts'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/build-info/src/events.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build-info/src/file-system.test.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build-info/src/file-system.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/prefer-string-starts-ends-with': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build-info/src/frameworks/angular.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/build-info/src/frameworks/docusaurus.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build-info/src/frameworks/framework.test.ts'],
    rules: {
      'vitest/no-identical-title': 'off',
    },
  },
  {
    files: ['packages/build-info/src/frameworks/framework.ts'],
    rules: {
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/build-info/src/frameworks/next.test.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['packages/build-info/src/frameworks/nuxt.test.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['packages/build-info/src/frameworks/observable.test.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/build-info/src/frameworks/remix.test.ts'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/build-info/src/get-framework.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'vitest/valid-title': 'off',
    },
  },
  {
    files: ['packages/build-info/src/logger.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/build-info/src/metrics.test.ts'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build-info/src/metrics.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build-info/src/node/bin.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/build-info/src/node/file-system.ts'],
    rules: {
      '@typescript-eslint/return-await': 'off',
    },
  },
  {
    files: ['packages/build-info/src/node/get-build-info.test.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['packages/build-info/src/node/get-build-info.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/build-info/src/node/metrics.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build-info/src/package-managers/detect-package-manager.test.ts'],
    rules: {
      'vitest/no-identical-title': 'off',
    },
  },
  {
    files: ['packages/build-info/src/package-managers/detect-package-manager.ts'],
    rules: {
      '@typescript-eslint/prefer-reduce-type-parameter': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/build-info/src/project.test.ts'],
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['packages/build-info/src/project.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build-info/src/settings/get-build-settings.test.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['packages/build-info/src/settings/get-build-settings.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  {
    files: ['packages/build-info/src/settings/get-toml-settings.test.ts'],
    rules: {
      'vitest/no-identical-title': 'off',
    },
  },
  {
    files: ['packages/build-info/src/settings/get-toml-settings.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build-info/src/settings/netlify-toml.ts'],
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': 'off',
    },
  },
  {
    files: ['packages/build-info/src/workspaces/detect-workspace.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['packages/build-info/src/workspaces/get-workspace-packages.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/build-info/tests/bin.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build-info/tests/helpers.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/build-info/tests/mock-file-system.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build-info/tests/test-setup.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/core/bin.js'],
    rules: {
      'n/hashbang': 'off',
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/core/build.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/core/config.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/core/constants.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/core/dev.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/core/dry.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/core/feature_flags.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/core/lingering.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/core/main.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/build/src/core/missing_side_file.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/core/normalize_flags.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build/src/core/types.ts'],
    rules: {
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/build/src/core/user_node_version.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/env/changes.js'],
    rules: {
      '@typescript-eslint/no-dynamic-delete': 'off',
    },
  },
  {
    files: ['packages/build/src/env/main.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build/src/error/api.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/error/build.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/error/handle.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/build/src/error/info.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/error/monitor/print.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/error/monitor/report.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/error/monitor/start.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/error/parse/location.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/error/parse/parse.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/error/parse/plugin.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build/src/error/parse/properties.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/error/parse/serialize_log.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/error/parse/serialize_status.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/build/src/error/report.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build/src/error/types.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/index.ts'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/install/main.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/install/missing.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/description.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/log/logger.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/compatibility.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/config.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/core.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/core_steps.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/dry.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/install.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/ipc.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/mutations.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/plugins.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/status.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/messages/steps.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/log/output_flusher.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/build/src/log/stream.ts'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/build/src/log/theme.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/error.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/load.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/logic.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/main.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/run.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/status.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/typescript.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/utils.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/child/validate.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/compatibility.test.ts'],
    rules: {
      'vitest/no-identical-title': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/compatibility.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/error.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/expected_version.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/ipc.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/list.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/load.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/manifest/check.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/manifest/load.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/manifest/main.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/manifest/path.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/manifest/validate.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/node_version.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/options.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/pinned_version.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/plugin_conditions.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/resolve.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins/spawn.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/blobs_upload/index.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/build_command.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/deploy/buildbot_client.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/deploy/index.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/dev_blobs_upload/index.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/edge_functions/index.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/edge_functions/validate_manifest/validate_edge_functions_manifest.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/frameworks_api/index.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/frameworks_api/util.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/functions/error.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/functions/index.ts'],
    rules: {
      'import/named': 'off',
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/functions/utils.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/functions/zisi.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/pre_cleanup/index.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/secrets_scanning/index.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/secrets_scanning/utils.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
    },
  },
  {
    files: ['packages/build/src/plugins_core/types.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/build/src/report/statsd.ts'],
    rules: {
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['packages/build/src/status/load_error.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/status/report.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/status/success.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/status/validations.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/core_step.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/error.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/get.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/plugin.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/return.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/run_core_steps.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/run_step.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/run_steps.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/steps/update_config.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/src/telemetry/main.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/time/aggregate.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/build/src/time/main.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/time/report.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/build/src/types/netlify_event_handler.ts'],
    rules: {
      '@typescript-eslint/prefer-function-type': 'off',
    },
  },
  {
    files: ['packages/build/src/utils/blobs.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/src/utils/errors.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/build/src/utils/json.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/test-d/config/inputs.ts'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/test-d/config/netlify_config.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
    },
  },
  {
    files: ['packages/build/test-d/netlify_plugin.ts'],
    rules: {
      null: 'off',
    },
  },
  {
    files: ['packages/build/test-d/netlify_plugin_options.ts'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/build/test-d/options/netlify_plugin_cache_util.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['packages/build/test-d/options/netlify_plugin_functions_util.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['packages/build/test-d/options/netlify_plugin_run_util.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['packages/build/test-d/options/netlify_plugin_status_util.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['packages/build/tests/functions/tests.js'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    files: ['packages/cache-utils/src/expire.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/cache-utils/src/fs.ts'],
    rules: {
      null: 'off',
    },
  },
  {
    files: ['packages/cache-utils/src/hash.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/cache-utils/src/main.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/cache-utils/src/manifest.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/cache-utils/src/path.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/cache-utils/tests/dir.test.ts'],
    rules: {
      'import/named': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/cache-utils/tests/helpers/main.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/config/src/api/build_settings.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/api/client.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/api/site_info.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  {
    files: ['packages/config/src/base.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/config/src/bin/flags.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/config/src/bin/main.js'],
    rules: {
      'n/hashbang': 'off',
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/build_dir.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/config/src/context.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/config/src/edge_functions.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/config/src/env/envelope.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/config/src/env/git.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/env/main.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/prefer-reduce-type-parameter': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/config/src/error.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/config/src/files.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/config/src/functions_config.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/index.ts'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/integrations.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/config/src/log/messages.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/log/options.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/main.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/config/src/merge.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/merge_normalize.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/config/src/mutations/apply.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/mutations/update.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/normalize.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/config/src/options/main.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/origin.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/parse.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/config/src/path.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/config/src/redirects.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/config/src/simplify.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/utils/extensions/auto-install-extensions.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/return-await': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/config/src/utils/extensions/utils.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/config/src/validate/identical.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/validate/main.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/src/validate/validations.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/config/tsfixme.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/bundle.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/config.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.177.0/_util/os.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.177.0/path/_util.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.177.0/path/glob.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.177.0/path/posix.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.177.0/path/win32.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.98.0/async/deferred.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.98.0/async/mux_async_iterator.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.98.0/async/pool.ts'],
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/std@0.98.0/async/tee.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/dir@1.5.1/data_local_dir/mod.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/eszip@v0.55.2/eszip_wasm.generated.js'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-array-constructor': 'off',
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/eszip@v0.55.2/loader.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/eszip@v0.55.2/mod.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/deps.ts'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/misc.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/decorator.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/options.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/retry.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/tooManyTries.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/utils/untilDefined/decorators.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/utils/untilDefined/retry.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/utils/untilResponse/decorators.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/utils/untilResponse/retry.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/utils/untilTruthy/decorators.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/retry/utils/untilTruthy/retry.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/wait/decorators.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/wait/timeoutError.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/retry@v2.0.0/wait/wait.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/wasmbuild@0.15.1/cache.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/deno/vendor/deno.land/x/wasmbuild@0.15.1/loader.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/return-await': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/bridge.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/bridge.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/bundler.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/bundler.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/config.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/config.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/declaration.ts'],
    rules: {
      null: 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/deploy_config.test.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/deploy_config.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/downloader.test.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-misused-spread': 'off',
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/downloader.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/feature_flags.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/finder.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/formats/eszip.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/formats/javascript.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/import_map.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/import_map.ts'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-reduce-type-parameter': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/main.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/manifest.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      null: 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/npm_dependencies.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/npm_import_error.ts'],
    rules: {
      '@typescript-eslint/prefer-regexp-exec': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/package_json.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/server/server.test.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-for-in-array': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/server/server.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/server/util.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/stage_2.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/utils/error.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/utils/sha256.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/validation/manifest/error.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/validation/manifest/index.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/node/validation/manifest/index.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      null: 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/test/integration/functions/func1.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/test/integration/internal-functions/func2.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    files: ['packages/edge-bundler/test/util.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/functions-utils/src/main.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/functions-utils/tests/main.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/git-utils/src/commits.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/git-utils/src/diff.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/git-utils/src/exec.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/git-utils/src/main.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/git-utils/src/match.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['packages/git-utils/src/refs.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/git-utils/src/stats.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/git-utils/tests/main.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/headers-parser/src/line_parser.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/headers-parser/src/merge.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/headers-parser/src/netlify_config_parser.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/headers-parser/src/normalize.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/headers-parser/src/types.ts'],
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': 'off',
    },
  },
  {
    files: ['packages/js-client/src/index.test.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/js-client/src/index.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/js-client/src/methods/response.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/js-client/src/omit.ts'],
    rules: {
      '@typescript-eslint/no-dynamic-delete': 'off',
    },
  },
  {
    files: ['packages/js-client/src/operations.js'],
    rules: {
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['packages/js-client/src/operations.test.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      null: 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/js-client/src/types.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
    },
  },
  {
    files: ['packages/nock-udp/src/main.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['packages/nock-udp/tests/helpers/udp_server.ts'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/nock-udp/tests/main.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/opentelemetry-sdk-setup/src/bin.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/opentelemetry-sdk-setup/src/sdk-setup.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/opentelemetry-sdk-setup/src/util.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/opentelemetry-sdk-setup/tests/main.test.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/opentelemetry-utils/src/index.ts'],
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/opentelemetry-utils/tests/main.test.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/redirect-parser/src/all.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/redirect-parser/src/merge.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/redirect-parser/tests/all.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/redirect-parser/tests/helpers/main.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/redirect-parser/tests/line-parser.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/redirect-parser/tests/merge.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/redirect-parser/tests/netlify-config-parser.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/run-utils/src/main.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
    },
  },
  {
    files: ['packages/testing/src/fixture.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['packages/testing/src/normalize.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/testing/src/server.ts'],
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/testing/src/tcp_server.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/benchmarks/helpers/main.js'],
    rules: {
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/bin.js'],
    rules: {
      'n/no-unpublished-bin': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/archive.ts'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/bin.ts'],
    rules: {
      'n/hashbang': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/config.ts'],
    rules: {
      '@typescript-eslint/no-misused-spread': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/feature_flags.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/main.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/rate_limit.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/detect_runtime.ts'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/go/builder.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/go/index.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/esbuild/bundler.ts'],
    rules: {
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/esbuild/index.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/esbuild/plugin_native_modules.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      null: 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/esbuild/src_files.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/index.ts'],
    rules: {
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/nft/es_modules.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/nft/index.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/nft/transformer.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/nft/transpile.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/none/index.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/zisi/index.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/zisi/list_imports.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/zisi/nested.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/zisi/resolve.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/zisi/side_files.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/zisi/src_files.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/bundlers/zisi/traverse.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/in_source_config/index.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/index.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/parser/bindings.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/parser/exports.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/parser/helpers.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/parser/imports.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/parser/index.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/utils/package_json.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/node/utils/zip.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/rust/builder.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/runtimes/rust/index.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/utils/cache.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/utils/format_result.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/utils/fs.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/utils/matching.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/utils/remove_undefined.ts'],
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/utils/routes.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/src/zip.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/bin.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/esbuild.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/esbuild_migration.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/helpers/lambda.ts'],
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-misused-spread': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/helpers/main.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/helpers/test_many.ts'],
    rules: {
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/helpers/vitest_setup.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/list_functions_files.test.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/main.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'vitest/expect-expect': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/symlinked_included_files.test.ts'],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/telemetry.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/unit/runtimes/node/in_source_config.test.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/v2api.test.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: ['packages/zip-it-and-ship-it/tests/zip_function.test.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  {
    files: ['packages/build/tests/core/tests.js'],
    rules: {
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    files: ['packages/build/tests/error_reporting/tests.js'],
    rules: {
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    files: ['packages/build/tests/monitor/tests.js'],
    rules: {
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    files: ['packages/build/tests/plugins_events/tests.js'],
    rules: {
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    files: ['packages/build/tests/time/tests.js'],
    rules: {
      'import/no-named-as-default-member': 'off',
    },
  },
]
