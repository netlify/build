# TODO

Known problems left out of the type-safety work. Each was checked at the tip of the type-safety branch. File paths are
under `src/`.

## Bugs

### `runCoreSteps()`

- It doesn't pass `testOpts` to error handling. With an error monitor (`BUGSNAG_KEY` set), any step failure makes
  `reportError()` throw `Cannot read properties of undefined (reading 'errorMonitor')`, so `runCoreSteps()` rejects
  instead of returning `{ success: false }`. `error/monitor/report.ts:174`.
- It doesn't pass `userNodeVersion` to the steps, so `runCoreSteps(['functions_bundling'])` throws
  `Invalid version. Must be a string. Got type "undefined".` unless `AWS_LAMBDA_JS_RUNTIME` is set.
  `plugins_core/functions/zisi.ts:39`. netlify-cli only runs `blobs_upload` and `edge_functions_bundling`.
- It resolves the config with only `config`, `defaultConfig`, `featureFlags`, `mode`, `repositoryRoot`, `packagePath`
  and `cachedConfig`: no `context`, `branch`, `siteId` or `token`, so without a cached config there are no UI settings
  or site env vars, and the context is `production`. `steps/run_core_steps.ts`.

### Configuration

- `getConfigOpts()` forwards neither `debug` nor `logs`/`buffer` to `resolveConfig()`. `--debug` doesn't enable config's
  debug output, and config's warnings go to stderr even when the build buffers its logs. `core/config.js`.
- `resolveUpdatedConfig()` drops `cachedConfig`, so every config change (plugin mutation, `_redirects` appearing)
  re-runs getSite, accounts and extensions requests. An API failure then fails the build as a config error, and
  `siteInfo` can change mid-build. `core/config.js`.
- A cached config from `--cachedConfigPath` without `defaultConfig` keeps `buildPlugin.packageURL` a string, so
  `install/missing.ts:92` throws `unsupported build plugin package URL` for `has_build` extensions. Fix here (accept
  strings) or in `@netlify/config` (see its TODO).

### Dry runs

- Conditions get only `buildDir`, `constants`, `netlifyConfig`, `buildbotServerSocket` and `featureFlags`, so those
  reading more see `undefined`: `blobs_upload`/`dev_blobs_upload` (`deployId`, `packagePath`) are never listed, and
  `db_setup` ignores a monorepo package's `@netlify/database`. `core/dry.ts`.

### Binary

- A `--featureFlags` value yargs doesn't parse as a string crashes on `.split()`: `--featureFlags=1`, a bare
  `--featureFlags`, or a repeated one. `core/bin.ts:43`. `netlify-config` now ignores these.

### Error reporting

- A `buildCommand` or `functionsBundling` error without `location` makes `reportBuildError()` throw
  `Cannot read properties of undefined` from its group function, masking the original error.
  `error/monitor/report.ts:86`.

## Edge cases

- A plugin whose `package.json` `version` is not valid semver crashes with `TypeError: Invalid version: <v>` instead of
  a plugin error. `utils/semver.ts:15`.
- A plugins-list entry whose versions feature flags filter out entirely, or that has none, throws
  `Cannot read properties of undefined (reading 'version')`. `plugins/expected_version.ts:115`,
  `plugins/compatibility.ts:230`.
- Pinning after a dry run in buildbot mode throws on the missing `failedPlugins`. Probably unreachable.
  `plugins/pinned_version.ts:131`.
- A plugin that throws an empty array fails in error normalization with
  `Cannot set properties of undefined (setting 'errors')`. `error/parse/normalize.ts:33`.
- A programmatic build whose `build.command` has no or an unknown `commandOrigin` prints an `undefined` step header.
  `plugins_core/build_command.ts:83`.
- `testOpts.skipPluginList` with an unresolvable plugin throws the `dirname()` `TypeError` without its `code`. Tests
  only. `plugins/options.ts:79`.
- Secrets scanning prints non-string override values from `netlify.toml` with `String()`: an inline table prints
  `[object Object]`. `plugins_core/secrets_scanning/index.ts:28`.

## Simplifications by changing behaviour

- **Imitated crashes.** About 20 guards throw hand-written copies of old V8 `TypeError`s to keep messages identical.
  Most are unreachable and could become plain assertions or go: `plugins/child/main.ts:58`, `plugins/child/run.ts:60`,
  `plugins/ipc.ts:179`, `plugins/load.ts:135`, `plugins/spawn.ts:228`, `plugins/resolve.ts:281`,
  `error/parse/location.ts:26`, `time/aggregate.ts:36`, `plugins_core/db_setup/migrations.ts:29`,
  `plugins_core/db_setup/validation.ts:32`, `plugins_core/edge_functions/index.ts:48`. The reachable ones (the bugs and
  edge cases above) should become user or plugin errors with real messages. Risk: Bugsnag groups by message, so existing
  groups split.
- **Error reporting without `testOpts`.** `reportError()` could read `testOpts?.errorMonitor` instead of crashing, which
  also fixes the first `runCoreSteps()` bug. `error/monitor/report.ts:174`.
