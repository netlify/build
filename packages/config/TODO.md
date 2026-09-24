# TODO

Known problems left out of the type-safety work. Each was checked against the current `src/`. `SPEC §n.m` is the
behaviour spec; "quirk" there means kept on purpose, and removing one is a breaking change.

## Bugs

### Merging and contexts

- A key named like an `Object.prototype` member is dropped by `deepmerge`: `[context.constructor]` merges nothing (the
  merge drops it before the own-property lookup, so wildcards apply instead), and `[build.environment] toString = "x"`
  vanishes. SPEC §7.1, §8.
- `[context.x] command = "a"` together with `[context.x.build] publish = "b"` loses `command`: the later `build` key
  replaces the build properties gathered before it. SPEC §7.2.
- A UI-installed plugin listed under a wildcard context (`[[context."feat/*".plugins]]`) without inputs always throws.
  The key is compared exactly with the context and branch, and never equals either. SPEC §7.4.

### Loading and paths

- `config: 'custom.toml'` whose `build.base = "sub"` points to a directory with no `netlify.toml` (and none at the root
  or above) is silently discarded: `configPath` becomes `undefined` and its settings are lost. SPEC §6.3.
- A directory directly in the root whose name starts with `..` (`publish = "..foo"`) is rejected as outside the
  repository root. The check is `startsWith('..')`. SPEC §11.2.
- A `.git` file (git worktree, submodule) is not a repository root, so the search walks past it to an ancestor or falls
  back to cwd. SPEC §3.1. Affects `netlify dev` run in a worktree.
- With a symlink in the root path (macOS `/tmp`), the monorepo base comes out as `../…`: the relative path is computed
  from the non-realpath'd root to the realpath'd package. SPEC §3.4.
- A stat error other than "not found" on `cwd`/`repositoryRoot` (`EACCES`, `ENOTDIR`), or a non-string path, surfaces
  raw instead of as a user error. SPEC §3.3.
- An unreadable or invalid `cachedConfigPath` throws the raw fs error or `SyntaxError` (bug error). SPEC §5.6.

### Errors and validation

- Inline duplicates (`inlineConfig.plugins: [{ package: 'a' }, { package: 'a' }]`) report
  `Plugin "a" must not be specified twice in undefined`: only `config` and `ui` have a place name. SPEC §9.6.
- Errors in a context entry are labelled relative to it: `[context.dev] command = true` reports `build.command` with the
  invalid syntax `[build] command = true`. SPEC §10.1.
- Extensions with `has_build: true` and a `version` that isn't an absolute URL throw `TypeError: Invalid URL` (bug
  error) instead of skipping or naming the extension. SPEC §14.1.

### Mutations, `updateConfig`, `cleanupConfig`

- `keys: ['functions.*']` passes the permission check as `functions.*` and writes `functions.undefined`. SPEC §15.3,
  §15.5.
- A negative integer key corrupts arrays: `['build', 'environment', -1]` on `[1, 2]` gives `[1, 'x', 1, 2]`. SPEC §15.5.
- `updateConfig` with neither `configPath` nor `outputConfigPath` backs up, deletes `_headers` and `_redirects` without
  writing their content anywhere, then throws `TypeError: updateConfig() needs configPath or outputConfigPath`. SPEC
  §16.1.
- A mixed-type array in a mutated value (`build.environment.X = [1, 'a']`) makes the TOML writer throw a bug `Error`.
  SPEC §16.3.

### Extensions and cache

- A cached config read from `cachedConfigPath` keeps `buildPlugin.packageURL` as a string. Returned as is (no
  `defaultConfig`), `@netlify/build`'s `install/missing.ts` then throws `unsupported build plugin package URL`. SPEC
  §5.6, §14.1. Path: buildbot `--cachedConfigPath` with `has_build` extensions. Verify against the buildbot before
  fixing.
- Auto-install reads `<buildDir>/package.json` through `require()`, cached per process: a long-running `netlify dev`
  never sees added dependencies. SPEC §14.4.

### Types

- `EnvironmentVariable.value` is typed `string`, but `null`/`undefined` from JSON sources or mutations are kept as is
  (`keepAsIs` cast in `env.ts`). SPEC §13.2.
- The published `@netlify/api` types declare `listAccountsForUser()` without parameters, so the internal
  `{ minimal: 'true' }` needs `Reflect.apply`. The parameter is `x-internal`; fix in js-client or keep the call.

### Binary

- `--output=` (empty) is not `-`: the write fails with exit code 2. SPEC §19.3.
- `--version` prints the host project's `package.json` version, not this package's. SPEC §19.2.

## Edge cases

- Integer keys replace an object with an array and fill gaps with `undefined`: `['build', 'environment', 2]` gives
  `environment = [undefined, undefined, 'x']`, whose holes serialize as `null`. SPEC §15.5.
- A key containing a dot is checked as a path but written literally: `['build.command']` writes a top-level
  `"build.command"`. SPEC §15.5.
- Non-string env values are stringified without a warning: `ARR = [1, 2]` gives `'1,2'`, an inline table
  `'[object Object]'`, as does a null-prototype object. SPEC §13.2.
- `siteInfo.name` is not checked: a number gives `SITE_NAME: '5'`, `null` gives `https://branch--null.netlify.app`.
  `branch` is not sanitized, so `feature/x` gives an invalid `DEPLOY_PRIME_URL` host. SPEC §13.6.
- When the first pass's final base is `undefined` (a default base cleared by `base = ""`), the second pass reads the
  second file's own `build.base` and uses it as `buildDir` without searching there or running a third pass. SPEC §6.3.
- `NETLIFY_BUILD_DEBUG=false` or `0` enables debug output: any non-empty string counts. SPEC §2.4.
- `functions.directory = {}` defines a function named `directory`; `functions.directory = ""` leaves origin `config` on
  the default directory. SPEC §9.7, §11.4.
- A **file** at `netlify/functions` or `netlify/edge-functions` counts as the default directory. SPEC §11.4.
- A higher layer's blank `publish`/`command` erases the value but keeps the lower origin, so the CLI's
  `publishOrigin === 'default'` test treats a defaulted publish as user-set. SPEC §9.3.
- `build_settings` without `base_rel_dir` gives `baseRelDir: false`, not the `true` default. SPEC §5.4.
- A dev extension without `dev.path` over an API extension with a build gets `has_build: false` but keeps the API's
  `buildPlugin`. SPEC §14.1.
- `restoreConfig` with mutations but no prior `updateConfig` deletes `netlify.toml`, `_headers` and `_redirects` that
  have no backup. SPEC §16.2.
- `updateConfig` drops a `''` env var from the written `netlify.toml`. SPEC §16.4.
- With `configMutationsOrigin`, every load error is blamed on that origin, including a file syntax error; without it, an
  `inlineConfig` error is prefixed with the file's path. SPEC §1.4.3.
- Auto-install ignores `host` and `testOpts.host`, so staging builds query the production extension API. SPEC §14.4.
- `vcpu = NaN` from code reports the TOML serializer's `Number must be finite.`, not the rule message. SPEC §10.2.
- Lenient warnings on accepted values: `inputs: null` (removed, then "expected record"), a plugin `origin` outside the
  enum, and `memory = NaN`/`Infinity` from code. SPEC §10.4.
- Binary: surrounding double quotes are stripped, so a JSON string literal can't be passed; `--featureFlags=a, b` gives
  `' b'`; bare or repeated `--featureFlags` is ignored; repeated `--configMutations` parse `"a,b"`. SPEC §19.2.
- Case duplicates across paths lose the ` for "/a"` suffix: `/a {test, Test}` plus `/b {test}`. SPEC §12.3.

## Simplifications by changing behaviour

- **Second pass.** Keep only its result: drop the first pass's warnings (logged twice when the same file is read again)
  and don't fail on its errors. Base `/` or `.` needn't trigger a pass. SPEC §6.3.
- **Plugin-like arrays.** Merge by `package` only at `plugins`, not every array of `{ package }` objects at any depth,
  and let a later `plugins: []` clear. SPEC §8. Risk: a `defaultConfig` relying on `[]` not clearing UI plugins.
- **Capitalized keys.** Drop `Build`/`Command`/… normalization, the unvalidated spread of a non-object `Build`, and the
  `defaultConfig.Build` drop. SPEC §5.3, §9.2. Risk: old files with `[Build]`; count usage first.
- **Inline contexts.** Reject or drop `inlineConfig.context` instead of validating it and keeping it verbatim as
  `config.context`. SPEC §1.3.1, §7.3.
- **Non-object options.** Reject a non-object `defaultConfig`, `inlineConfig` or `featureFlags` instead of warning and
  spreading (`'ab'` → `{ 0: 'a', 1: 'b' }`). No consumer passes one. SPEC §2.5, §2.6.
- **Cached short-circuit.** Use this call's `token` and `logs`, not the cached ones, and test `defaultConfig == null`
  rather than `=== undefined`. SPEC §5.6. Risk: buildbot and CLI cache paths; the `=== undefined` test itself is
  load-bearing (SPEC §20.5).
- **UI settings.** Let a present `defaultConfig.functionsDirectory` beat `functions_dir`, stop an `undefined`-valued key
  masking a UI value, and apply `siteInfo.plugins` without `build_settings`. SPEC §5.2.
- **Function directory origin.** Report the layer that set it, not `config`/`config-v1` for all. SPEC §9.7.
- **Explicit `baseRelDir: false`.** Also skip the monorepo base override. SPEC §3.4.
- **Config file search.** Stop at the repository root, and search `{base}/netlify.toml` when `packagePath` is set. SPEC
  §6.1. Risk: setups relying on a `netlify.toml` above the repo.
- **Backslash pre-check.** Drop it and rely on the TOML parser's `unrecognized escape sequence`: it misses indented,
  first-line and non-letter keys, and flags valid literal strings between two `"""` strings. SPEC §6.6.
- **General env overrides.** Treat `SITE_ID`, `DEPLOY_URL`, `LANG`, … as read-only like `BRANCH`. SPEC §13.2. Risk:
  users overriding them on purpose.
- **Internal env.** Reuse only entries whose first source is `internal`, not any entry listing it. SPEC §13.5.
- **Log line transform.** Replace each blank line with U+200B one for one, without collapsing runs. SPEC §18.2.
