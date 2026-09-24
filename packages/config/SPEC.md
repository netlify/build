# @netlify/config — Behaviour specification

This document specifies the observable behaviour of `@netlify/config`: what it reads, what it returns, what it writes,
what it prints, and the exact texts of its errors and warnings. It describes the package as it is, not as it should be.
Items marked **(quirk)** are observable, plausibly relied on, and must be kept unless a breaking change is intended.
Cite items as `SPEC §n.m`.

## 0. Conventions

- **empty**: `undefined`, `null`, `''`, or a string of only whitespace. `false`, `0`, `NaN`, `[]` and `{}` are not
  empty.
- **blank**: `''` or a whitespace-only string.
- **present**: not empty. Used for option and config values where `false` and `0` count.
- **plain object**: a `{}` literal or a null-prototype object. Arrays and `null` are not plain objects.
- **R**: the resolved repository root (absolute). **cwd**: the resolved `cwd` option (absolute).
- **baseRel**: the directory config paths resolve against: the build directory when `baseRelDir` is true, else R.
- **combinedEnv**: `process.env` overlaid key by key by the `env` option.
- **user error**: a thrown `Error` carrying the marker of §1.4.1. Any other thrown value is a **bug error**.
- **warning**: a message logged through the logger (§18) in the warning colour. Warnings never throw.
- **CTA**: the literal text
  `Double-check your login status with 'netlify status' or contact support with details of your error.`

## 1. Public API

### 1.1 Exports

The package has one entry point (its root). Nothing else is importable.

| Export                                          | Kind           | Section      |
| ----------------------------------------------- | -------------- | ------------ |
| `resolveConfig(options?)`                       | async function | §1.2, §2–§14 |
| `mergeConfigs(configs, { concatenateArrays? })` | function       | §8           |
| `applyMutations(inlineConfig, configMutations)` | function       | §15          |
| `updateConfig(configMutations, options)`        | async function | §16.1        |
| `restoreConfig(configMutations, options)`       | async function | §16.2        |
| `cleanupConfig(config)`                         | function       | §17          |
| `EVENTS`                                        | array          | §15.1        |
| `DEV_EVENTS`                                    | array          | §15.1        |

Type declarations ship with the package. Type names are not part of this behavioural contract; the value shapes below
are.

The package also ships the `netlify-config` binary (§19).

### 1.2 `resolveConfig` options

`resolveConfig(options?)` takes one optional object. Every property is optional. Unknown properties are ignored. Every
top-level option whose value is empty is treated as absent (§2.1). For options with an env fallback, the precedence is:
present option > present env var in combinedEnv > default.

| Option                  | Type                                | Default                        | Env fallback                    | Notes                                             |
| ----------------------- | ----------------------------------- | ------------------------------ | ------------------------------- | ------------------------------------------------- |
| `config`                | string                              | none                           | —                               | Config file path, relative to cwd (§6.1)          |
| `defaultConfig`         | object                              | `{}`                           | —                               | Lowest-priority config source (§5)                |
| `inlineConfig`          | object                              | `{}`                           | —                               | Highest-priority config source (§5)               |
| `configMutations`       | `ConfigMutation[]`                  | `[]`                           | —                               | Applied on top of `inlineConfig` (§15)            |
| `configMutationsOrigin` | string                              | none                           | —                               | Changes the error prefix (§1.4.3)                 |
| `cachedConfig`          | object                              | none                           | —                               | A previous result (§5.6)                          |
| `cachedConfigPath`      | string                              | none                           | —                               | JSON file holding a previous result (§5.6)        |
| `cwd`                   | string                              | `process.cwd()`                | —                               | §3.3                                              |
| `repositoryRoot`        | string                              | nearest `.git` ancestor (§3.1) | —                               |                                                   |
| `packagePath`           | string                              | none                           | —                               | Monorepo package, relative to base/root (§6.1)    |
| `base`                  | string                              | derived from cwd (§3.4)        | —                               | Written into `defaultConfig.build.base` (§5.3)    |
| `baseRelDir`            | boolean                             | §5.4                           | —                               |                                                   |
| `branch`                | string                              | git (§3.2)                     | `BRANCH`                        |                                                   |
| `context`               | string                              | `'production'`                 | `CONTEXT`                       | §2.3                                              |
| `siteId`                | string                              | none                           | `NETLIFY_SITE_ID`               |                                                   |
| `accountId`             | string                              | none                           | —                               |                                                   |
| `deployId`              | string                              | `'0'`                          | `DEPLOY_ID`                     | §2.3                                              |
| `buildId`               | string                              | `'0'`                          | `BUILD_ID`                      | §2.3                                              |
| `skewProtectionToken`   | string                              | none                           | `NETLIFY_SKEW_PROTECTION_TOKEN` |                                                   |
| `token`                 | string                              | none                           | `NETLIFY_AUTH_TOKEN`            |                                                   |
| `host`                  | string                              | none                           | `NETLIFY_API_HOST`              | API host, no scheme                               |
| `scheme`, `pathPrefix`  | string                              | none                           | —                               | API client (§4.1)                                 |
| `siteFeatureFlagPrefix` | string                              | none                           | —                               | getSite query (§4.3)                              |
| `mode`                  | string                              | `'require'`                    | —                               | Any string; `'buildbot'` is special (§4.2, §13.1) |
| `offline`               | boolean                             | `false`                        | —                               |                                                   |
| `debug`                 | boolean                             | §2.4                           | `NETLIFY_BUILD_DEBUG`           |                                                   |
| `buffer`                | boolean                             | `false`                        | —                               | §18.1                                             |
| `env`                   | `Record<string, string\|undefined>` | `{}`                           | —                               | §2.2                                              |
| `featureFlags`          | `Record<string, unknown>`           | `{}`                           | —                               | §2.5                                              |
| `testOpts`              | object                              | `{}`                           | —                               | §2.7                                              |

There is no `logs` option; a `logs` property is ignored (§18.1).

### 1.3 Result (`Config`)

After a full resolution the result object has exactly these 15 own keys, in this insertion order. Keys whose value is
`undefined` are still present in memory.

| Key              | Type                                                  | Value                                                           |
| ---------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| `siteInfo`       | object                                                | API site data (§4.3) or `{ id?, account_id? }` (§4.2)           |
| `integrations`   | array                                                 | Merged extensions (§14.1)                                       |
| `accounts`       | array                                                 | API accounts (§4.4) or `[]`                                     |
| `env`            | `Record<name, { sources, value }>`                    | §13                                                             |
| `configPath`     | string \| undefined                                   | Absolute path of the config file used, if any (§6)              |
| `redirectsPath`  | string                                                | `<build.publish>/_redirects`, always set (§12.1)                |
| `headersPath`    | string                                                | `<build.publish>/_headers`, always set (§12.1)                  |
| `buildDir`       | string                                                | Absolute build directory (§6.4)                                 |
| `repositoryRoot` | string                                                | Absolute R (§3.1)                                               |
| `config`         | object                                                | The resolved configuration (§1.3.1)                             |
| `context`        | string                                                | Resolved context (§2.3)                                         |
| `branch`         | string                                                | Resolved branch (§3.2)                                          |
| `token`          | string \| undefined                                   | The effective token                                             |
| `api`            | API client \| undefined                               | Present iff a token is present and `offline` is not true (§4.1) |
| `logs`           | `{ stdout: string[], stderr: string[] }` \| undefined | Only with `buffer` (§18.1); `stdout` is always `[]`             |

The result is a plain mutable object; consumers assign into it and into `config`.

A cached short-circuit (§5.6) returns a different object: `{ token, ...cached, api }`.

#### 1.3.1 `result.config`

Always present after full resolution:

- `build.publish` (absolute string) and `build.publishOrigin`.
- `build.environment` (object), `build.processing` with `css`, `html`, `images`, `js` objects, `build.services`
  (object).
- `functions` (object) with a `'*'` key.
- `headers` (array of `{ for, values }`) and `redirects` (array of minimal redirect objects).
- `plugins` (array); every item has `package`, `inputs` (object) and normally `origin` (§9.3).

Optional:

- `build.command` with `build.commandOrigin`; `build.base` (absolute; see §11.5); `build.ignore`; `build.edge_functions`
  (absolute).
- `functionsDirectory` (absolute) with `functionsDirectoryOrigin`. Whenever `functionsDirectory` is non-empty,
  `build.functions` is set to the same value.
- `headersOrigin`, `redirectsOrigin`, `edge_functions`, `images`, `dev`, `integrations`, `database`, `spa_fallback`, and
  any unknown property from any source, passed through unchanged.
- `context`: absent, except that `inlineConfig.context` is kept verbatim (§7.3) **(quirk)**.

Key order: properties in merge order, then `headers`, then `redirects` last.

### 1.4 Errors

#### 1.4.1 User-error marker

A user error is an `Error` with the own, writable property `customErrorInfo = { type: 'resolveConfig' }`. Consumers test
`error.customErrorInfo?.type === 'resolveConfig'` and may mutate `customErrorInfo`. Every error listed as a user error
in this document carries the marker. Everything else is a bug error.

#### 1.4.2 Composition

When a message wraps an underlying `Error`, the underlying object is thrown with its `message` rewritten to
`<message>\n<original message>` and the marker added. Its class and properties such as `code` are kept (a TOML parse
error keeps its class). When the underlying value is not an `Error`, a new `Error(<message>)` is thrown with the value
as its `cause`.

#### 1.4.3 Stage prefix

Any `Error` thrown while a load pass (§6) parses, merges, normalizes, validates, resolves paths, checks the build
directory, or adds headers and redirects has its `message` prefixed in place with one of:

| Condition                      | Prefix                                                        |
| ------------------------------ | ------------------------------------------------------------- |
| `configMutationsOrigin` given  | `When applying configuration from <configMutationsOrigin>:\n` |
| else, a config file was chosen | `When resolving config file <configPath>:\n`                  |
| else                           | `When resolving config:\n`                                    |

- The prefix applies to user errors and bug errors alike; the marker is unchanged. Non-`Error` values pass through.
- With `configMutationsOrigin`, every load error is blamed on that origin, even one caused by the file **(quirk)**.
- The path named is that of the pass that failed (§6.3).
- **No prefix**: option errors (§3.3), mutation errors (§15), API errors (§4), extension errors (§14), cached-config
  read errors (§5.6), and `updateConfig` errors (§16.1).

#### 1.4.4 Error catalogue

All are user errors unless marked bug. `<prefix>` means §1.4.3 applies.

| §    | Condition                                                                          | Message                                                                                                                        |
| ---- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 3.3  | `cwd` / `repositoryRoot` missing or not a directory                                | `Option 'cwd' points to a non-existing directory: <abs>` / `Option 'repositoryRoot' points to a non-existing directory: <abs>` |
| 3.3  | other stat error (`ENOTDIR`, `EACCES`), non-string path                            | raw error (bug)                                                                                                                |
| 4.3  | getSite fails                                                                      | `Failed retrieving site data for site <siteId>: <msg>. <CTA>`                                                                  |
| 4.4  | accounts request fails                                                             | `Failed retrieving user account: <msg>. <CTA>`                                                                                 |
| 4.5  | extensions request fails                                                           | `Failed retrieving extensions for site <siteId>: <msg>. <CTA>`                                                                 |
| 5.6  | `cachedConfigPath` unreadable or not JSON                                          | raw fs error / `SyntaxError` (bug)                                                                                             |
| 6.5  | chosen config file does not exist                                                  | `<prefix>Configuration file does not exist`                                                                                    |
| 6.5  | config file read fails                                                             | `<prefix>Could not read configuration file\n<fs message>`                                                                      |
| 6.6  | invalid backslash escape                                                           | `<prefix>In netlify.toml, the following backslash should be escaped: <seq>\nThe following should be used instead: \<seq>`      |
| 6.6  | TOML syntax error                                                                  | `<prefix>Could not parse configuration file\n<parser message>`                                                                 |
| 6.4  | base not a directory                                                               | `<prefix>Base directory does not exist: <abs base>`                                                                            |
| 11.2 | path outside R                                                                     | `<prefix>Configuration property "<prop>" "<value>" must be inside the repository root directory.`                              |
| 9.6  | duplicate plugin in one source                                                     | `<prefix>Plugin "<pkg>" must not be specified twice in <place>`                                                                |
| 7.4  | UI plugin in a non-matching context without inputs                                 | `<prefix>` + text of §7.4                                                                                                      |
| 10   | validation rule                                                                    | `<prefix>Configuration property <label> <message>\n…` (§10.2)                                                                  |
| 10.2 | error thrown while checking or formatting                                          | `<prefix><that error's message>`                                                                                               |
| 15.3 | mutation of read-only property                                                     | `"netlifyConfig.<prop>" is read-only.`                                                                                         |
| 15.4 | mutation after its last event                                                      | `"netlifyConfig.<prop>" cannot be modified after "<lastEvent>".`                                                               |
| 14.3 | dev build plugin not a tarball                                                     | `Extension <slug> contains unexpected build plugin URL: '<url>'. Build plugin URLs must end in '.tgz'.`                        |
| 14.1 | extension `has_build` with a non-URL `version`                                     | `TypeError: Invalid URL` (bug)                                                                                                 |
| 16.1 | updateConfig file errors                                                           | same texts as §6.5/§6.6, no prefix                                                                                             |
| 16.1 | updateConfig with no output path                                                   | `TypeError`: `updateConfig() needs configPath or outputConfigPath` (bug)                                                       |
| 16.3 | TOML serialization of a mixed-type array                                           | `<key>: Array cannot contain values of different types.` (bug)                                                                 |
| 17.2 | `cleanupConfig` with `build`, `build.environment`, a plugin or its `inputs` `null` | `TypeError`: `<name> must be an object` (bug)                                                                                  |
| 17.2 | `cleanupConfig` with a non-array `plugins`                                         | `TypeError`: `plugins must be an array` (bug)                                                                                  |

## 2. Option resolution

### 2.1 Emptiness

- Empty top-level options are treated as absent, and so are empty env fallback values. So `branch: ''`, `context: '  '`,
  `token: null` and `CONTEXT=' '` fall through to the next fallback.
- `false`, `0` and other non-empty values count as given and are not type-checked (`context: 0` stays `0`).
  `debug: false` beats `NETLIFY_BUILD_DEBUG`; `baseRelDir: false` and `offline: false` are kept.
- Nested values are not cleaned: `env: { NETLIFY_AUTH_TOKEN: '' }` keeps its empty value.

### 2.2 `env`

- combinedEnv is `{ ...process.env, ...env }`. An `env` key with value `''` or `undefined` still hides the `process.env`
  value **(quirk)**. Test harnesses rely on `env: { NETLIFY_AUTH_TOKEN: '' }` to hide a real token.
- `env` only feeds option defaults and the debug log. It is not `result.env` and does not reach child processes.

### 2.3 `context`, `deployId`, `buildId`

- Each is the option, else the env var (`CONTEXT`, `DEPLOY_ID`, `BUILD_ID`) when it is not empty, else the default
  (`'production'`, `'0'`, `'0'`). A whitespace-only env value counts as unset and gives the default.

### 2.4 `debug`

- A given `debug` (including `false`) wins.
- Otherwise `debug` is true iff `combinedEnv.NETLIFY_BUILD_DEBUG` is truthy (any non-`''` string), or
  `defaultConfig.build.environment.NETLIFY_BUILD_DEBUG` (raw option, lowercase `build` only) is truthy. Any non-empty
  string enables it, including `'false'` and `'0'` **(quirk)**. Non-object intermediate values read as absent and do not
  throw.

### 2.5 `featureFlags`

- The resolved value is a shallow copy of the given object, or `{}`. Values are not normalized; consumers test
  truthiness, so `'false'` enables a flag.
- A non-object is spread (`'ab'` becomes `{ '0': 'a', '1': 'b' }`), with no warning.
- Flags read by this package: `use_cached_site_info` (§5.6), `use_cached_site_info_logging` (§5.6),
  `send_build_bot_token_to_jigsaw` (§4.5), `auto_install_required_extensions_v2` (§14.4).

### 2.6 Shape checks on source options

- After defaults, a `defaultConfig` or `inlineConfig` that is not a plain object logs the warning
  `Unexpected defaultConfig option, which should be an object, spread into one` (or `inlineConfig`) and is replaced by
  the spread of its own entries: a string gives index-to-character keys, an array index-to-item keys, other primitives
  `{}`. Empty values become `{}` silently.
- `configMutations` is checked against: an array of objects with `keys: (string|number)[]`, a `value` key that is not
  `undefined`, and `event: string`; extra keys allowed. On mismatch the warning is
  `Unexpected configMutations option, used as is:\n<issues>` (§18.4) and the value is used unchanged. A missing `value`
  reports `expected nonoptional, received undefined` at `[i].value`.
- Order: defaultConfig warning, inlineConfig warning, configMutations warning, then the debug options log (§18.3).
- Properties inside these objects are validated later (§10).

### 2.7 `mode`, `offline`, `buffer`, `testOpts`, pass-through

- `mode` is not validated. It is sent in extension API headers (§4.5). `'buildbot'` takes the short site-data path
  (§4.2) and makes `result.env` `{}` (§13.1).
- `buffer` truthy creates a fresh `{ stdout: [], stderr: [] }` returned as `result.logs` (§18.1).
- `testOpts` is not validated; extra keys are ignored. Read fields: `env` (truthy: short site-data path even with an API
  client, §4.2), `host` and `scheme` (override the API client's, §4.1, and select the extension API URL, §4.5).
- `config`, `packagePath`, `accountId`, `scheme`, `pathPrefix`, `siteFeatureFlagPrefix`, `configMutationsOrigin`,
  `cachedConfig` and `cachedConfigPath` are forwarded unchanged.

### 2.8 Phase order

1. Defaults, emptiness, logs object, §2.6 warnings, debug options log.
2. API client creation (§4.1).
3. Cached config read; short-circuit return if applicable (§5.6). In that case §3 never runs: no git, no directory
   validation, and an invalid `cwd` does not error.
4. Repository root, branch, directory validation, base override (§3).
5. Site data (§4).
6. Default layer and inline layer built; "UI build settings" and "Configuration override" debug logs (§18.3).
7. Load passes (§6–§12).
8. Environment variables (§13).
9. Extension auto-install, then extension merge (§14).
10. Legacy `build.functions` mirror (§1.3.1), result assembly, result debug logs.

## 3. Directories and branch

### 3.1 `repositoryRoot`

- A present option is used as given at this step, even if relative.
- Otherwise, starting from cwd (resolved against `process.cwd()`), the first directory upwards that contains a
  **directory** named `.git` is the root; if none, cwd. A `.git` file (worktree, submodule) is not detected and the
  search continues upwards **(quirk)**. The search is on path strings, so a missing cwd can still find an ancestor.
- The root is then made absolute against `process.cwd()` (not against the `cwd` option). It is not realpath'd.

### 3.2 `branch`

Precedence: option, `BRANCH`, `git rev-parse --abbrev-ref HEAD`, `git rev-parse --abbrev-ref main`, `'master'`.

- git runs with its working directory at the step-3.1 root. Any failure falls through to the next step. stdout is used
  with the trailing newline stripped.
- A detached HEAD gives `'HEAD'` **(quirk)**. The `main` step only succeeds when HEAD cannot be resolved but a `main`
  ref exists.
- A whitespace-only `BRANCH` counts as absent and git is used. A blank git output counts as a failure and falls through
  to the next step, so `branch` is never `undefined`.
- Branch detection runs before directory validation, so git is spawned even when directories are invalid.

### 3.3 Directory validation

- `cwd` and `repositoryRoot` are resolved against `process.cwd()` and must be existing directories. Otherwise the user
  error `Option '<name>' points to a non-existing directory: <absolute path>` (also for a file). No prefix.
- A stat error other than "not found" (for example `ENOTDIR`, `EACCES`) is rethrown as is (bug). A non-string path gives
  a `TypeError` (bug).
- Both are checked concurrently; when both are invalid, `cwd` is reported in practice.
- The resolved `cwd` is absolute and not realpath'd. `process.cwd()` is only called when `cwd` is empty.

### 3.4 Base override from cwd (monorepo)

- If realpath(cwd) is strictly inside realpath(R), the directories from cwd up to, but excluding, R are checked, closest
  first. The first containing an entry (file or directory) named `.netlify`, `netlify.toml` or `package.json` supplies
  `base = relative(R, dir)` and `baseRelDir = true`.
- Explicit options win per key: a present `base` beats the override's; an explicit `baseRelDir` (even `false`) beats the
  override's. With only `base` explicit, the override still adds `baseRelDir: true`; with only `baseRelDir: false`
  explicit, the override's `base` still applies **(quirk)**.
- The relative path is computed from the non-realpath'd R to the realpath'd directory, so a symlink in R can yield a
  `../…` base **(quirk)**.

## 4. Site data

### 4.1 API client

- An API client exists iff `token` is present and `offline` is not truthy. `testOpts.env` does not suppress it.
- Parameters: `Authorization: Bearer <token>`; scheme `testOpts.scheme || scheme`; host `testOpts.host || host`;
  `pathPrefix`. Falsy parameters fall back to `https`, `api.netlify.com`, `/api/v1`.
- The client is created on every call, including a cached short-circuit.

### 4.2 Short path

Taken when there is no API client, or `mode === 'buildbot'`, or `testOpts.env` is truthy. No Netlify API request is
made.

- `siteInfo = { id: siteId }` if `siteId` is set, plus `account_id: accountId` if `accountId` is set; else `{}`.
- `accounts = []`.
- Extensions are fetched (§4.5) only when `mode === 'buildbot'` and not `offline` (even without a token); otherwise
  `[]`.

### 4.3 API path: site

Three requests start in parallel: getSite, accounts (§4.4) and extensions (§4.5). If any rejects, resolution rejects
with that error; when several fail, the first to reject wins.

- getSite: `GET <scheme>://<host><pathPrefix>/sites/<siteId>`, with query `feature_flags=<siteFeatureFlagPrefix>` only
  when that option is set. Skipped without `siteId` (yields `{}`).
- The response is checked leniently (§18.4, description `site information from the Netlify API`), then used unchanged
  with `id` overwritten: `{ ...response, id: siteId }`. Every API field passes through.
- Failure: `Failed retrieving site data for site <siteId>: <msg>. <CTA>`, where `<msg>` is the error's message (the HTTP
  status text for HTTP errors) or `String(value)`.
- Envelope: when all three succeed and `siteInfo.use_envelope` is truthy, a site-scoped envelope request (§13.4) is
  made, and `siteInfo.build_settings = { ...siteInfo.build_settings, env: <result> }`. This creates `build_settings` if
  absent and discards the API's `build_settings.env`. On failure, `env` becomes `{}`. The replacement is visible in
  `result.siteInfo`.

Lenient site shape (all optional, extra keys allowed): string `account_id`, `account_slug`, `id`, `name`, `ssl_url`;
boolean `use_envelope`; `feature_flags`; `plugins[]` of `{ package, inputs?, pinned_version? }`; `build_settings` with
nullable `base`, `cmd`, `dir`, `functions_dir`, `repo_url`, `base_rel_dir`, `env`.

### 4.4 API path: accounts

- `GET …/accounts?minimal=true`, always made on the API path, even without `siteId`.
- An array response is checked leniently (description `accounts from the Netlify API`; each item requires
  `slug: string`, and known fields such as `site_env`, `name`, `members_count` are typed) and used unchanged. A
  non-array response gives `[]` silently.
- Failure: `Failed retrieving user account: <msg>. <CTA>`.

### 4.5 Extensions request

- Not made when `siteId` is empty or `offline` is set (result `[]`).
- Base URL, first match:

| Condition                                          | Base                                 |
| -------------------------------------------------- | ------------------------------------ |
| `testOpts.host` contains `api-staging.netlify.com` | `https://api-staging.netlifysdk.com` |
| `testOpts.host` contains `api.netlify.com`         | `https://api.netlifysdk.com`         |
| `testOpts.host` otherwise non-empty                | `http://<testOpts.host>`             |
| `host` contains `api-staging.netlify.com`          | `https://api-staging.netlifysdk.com` |
| otherwise                                          | `https://api.netlifysdk.com`         |

- Path: `team/<accountId>/integrations/installations/meta/<siteId>` when the `accountId` option is set, else
  `site/<siteId>/integrations/safe`.
- Headers: `Netlify-Config-Mode: <mode>`; `User-Agent: Netlify Config (mode:<mode>) / <package version>`;
  `Netlify-SDK-Build-Bot-Token: <token>` only when `send_build_bot_token_to_jigsaw` is truthy and a token is present. No
  `Authorization` header.
- Only status 200 succeeds. The body must be an array of
  `{ author?: string, extension_token?: string, has_build: boolean, name: string, slug: string, version: string }`;
  unknown keys are stripped.
- Any failure (status, network, JSON, shape) throws `Failed retrieving extensions for site <siteId>: <msg>. <CTA>`. For
  a status failure `<msg>` is `Unexpected status code <status> from fetching extensions`; otherwise the error's message,
  or `unknown error` for a non-`Error`.
- Extensions are fetched before the config file is loaded, so their errors win over config errors.

## 5. Sources and precedence

### 5.1 Layers, lowest to highest

1. Normalization defaults (§9.4).
2. Existing default directories (§11.4), only where nothing else set the value.
3. UI build settings (§5.2).
4. `defaultConfig`, with the `base` option on top (§5.3). The whole default layer has origin `ui`.
5. `netlify.toml` top level (origin `config`).
6. Matching `[context.*]` entries for the context name (§7.1). Entries come from `defaultConfig` and the file; the file
   wins within a same-named entry. A `defaultConfig` context entry therefore beats a file top-level value.
7. Matching `[context.*]` entries for the branch name.
8. `inlineConfig` with `configMutations` applied (origin `inline`). Contexts cannot override it.

Layers are combined with `mergeConfigs` default mode (§8).

### 5.2 UI build settings

Applied only when `siteInfo.build_settings` is neither `undefined` nor `null` (API path, envelope, or reused cached site
info). `build_settings: null` is treated as absent.

- `cmd` → `build.command`, `dir` → `build.publish`, `base` → `build.base`, each only when present.
- The build object is `{ ...uiBuild, ...defaultConfig.build }`: `defaultConfig.build` wins key by key. A key present
  with value `undefined` masks the UI value **(quirk)**.
- `functions_dir`, when JS-truthy, sets top-level `functionsDirectory` and `functionsDirectoryOrigin: 'ui'`, overriding
  `defaultConfig.functionsDirectory` **(quirk)**. A blank value sets the origin, then path resolution deletes the
  directory, leaving the origin alone.
- `siteInfo.plugins` (default `[]`) are reduced to `{ package, inputs, pinned_version }` and placed before
  `defaultConfig.plugins`. Without `build_settings` they are ignored entirely **(quirk)**. A `defaultConfig.plugins`
  that is not an array (including `null`) is kept as is without the UI plugins, and fails §10.3 #4.
- `build_settings.env` is not added to `build.environment`; it is the `ui` env source (§13.2).
- Individual `null` fields behave as missing.

### 5.3 `base` option

A present `base` option (explicit or from §3.4) is written into `defaultConfig.build.base` before the UI settings are
applied, so it beats `defaultConfig.build.base` and UI `base`, but loses to the file, contexts and inline. When `base`
is set or UI settings apply, a capitalized `defaultConfig.Build` is dropped **(quirk)**.

### 5.4 `baseRelDir`

The option if given; else, when `build_settings` exists (not `null`), `Boolean(build_settings.base_rel_dir)`, which is
`false` when the field is missing **(quirk)**; else `true`.

### 5.5 Inline layer

The inline layer is `applyMutations(inlineConfig, configMutations)` (§15), computed before any loading. Mutation errors
surface unprefixed.

### 5.6 Cached config

- `cachedConfig` wins over `cachedConfigPath`. `cachedConfigPath` is read as UTF-8 JSON; read or parse failures are
  thrown raw (bug, no prefix).
- The value is checked leniently (description `cached config`) against the §1.3 shape (nested values only checked to be
  objects; `env` entries `{ sources: Source[], value: string }`; `api` not expected; extra keys allowed) and used
  unchanged.
- **Short-circuit**: if a cache was read and the raw `options.defaultConfig === undefined`, the result is
  `{ token: <option token>, ...cached, api: <fresh client or undefined> }`. No file read, no API request, no validation,
  no result debug logs; `context`, `branch` and other options are ignored.
  - A cached `token` wins over the option **(quirk)**.
  - `logs` is the cached object's `logs` (or absent), not this call's buffer, so warnings from this call are lost in
    buffer mode **(quirk)**.
  - `defaultConfig: null` or `''` counts as given and forces re-resolution, then becomes `{}` **(quirk)**.
- **Re-resolution** (a cache and a `defaultConfig`): everything is resolved again. The cached `config` is not reused.
  Reused: `cached.env` entries marked `internal` (§13.5); and `siteInfo`, `accounts`, `integrations` in place of all
  site-data requests (§4.3–§4.5 and the site envelope) when `use_cached_site_info` is truthy and all three are truthy
  (empty arrays count).
- When `use_cached_site_info_logging` is truthy, every resolution reaching site data logs (§18, not a warning)
  `Checking site information` followed by a space and the inspected
  `{ useCachedSiteInfo, siteInfo, accounts, extensions }` (Node `util.format`).

### 5.7 Processing order

Within each load pass: the file, then `defaultConfig`, then `inlineConfig`. Each source runs the per-source pipeline
(§9.1, §10.1) on its body, then on each of its context entries. So when several sources are invalid, the file's error is
reported. Then context plugin checks (§7.4), context selection, inline merge, post-merge normalization and validation.

## 6. File discovery and loading

### 6.1 Search order

For each pass, given `configBase` (absolute directory or undefined) and `packagePath`, the first match wins:

1. `config` option set: `resolve(cwd, config)`, chosen whether or not it exists (§6.5).
2. `configBase` or `packagePath` set: `join(configBase ?? R, packagePath ?? '')/netlify.toml`, if it exists.
3. `R/netlify.toml`, if it exists.
4. `netlify.toml` in cwd or any ancestor, not bounded by R **(quirk)**.
5. None: `configPath` is `undefined` and the file config is `{}`.

Only the name `netlify.toml` is searched. With both a base and `packagePath`, `{base}/netlify.toml` is not searched
(step 2 looks only in `{base}/{packagePath}`) **(quirk)**. Paths in a package's `netlify.toml` still resolve against
baseRel, not the package directory; only defaults include `packagePath` (§11.3, §11.4).

### 6.2 Initial base

The first pass's `configBase` is the inline `build.base` if it is not `undefined`, else `defaultConfig.build.base`,
resolved as in §11.1 against R with prop name `build.base`. The file is not consulted. An inline `null` does not fall
back to the default and gives `undefined`. A non-string or blank value gives `undefined`.

### 6.3 Second pass

- A pass's final base is the merged `build.base` (all sources, contexts included) resolved per §11.1 against R.
- A second pass happens iff `baseRelDir` is true and the final base differs (exact string comparison; `undefined`
  differs from any path) from the initial base.
- The second pass uses the first-pass final base as both `configBase` and fixed base, with no `config` option and no
  `packagePath`. The second file's own `build.base` is ignored (not recursive) and the fixed base is not re-checked
  inside R.
- All outputs come from the second pass. First-pass side effects remain:
  - its warnings are logged, and logged twice when the same file is read again **(quirk)**;
  - its errors are fatal even if the second pass would succeed **(quirk)**.
- Consequences **(quirk)**: base `/` or `.` resolves to R, triggers a second pass and sets `build.base` to R. A `config`
  file whose `build.base` points to a directory with no `netlify.toml` (and none at R or above) is discarded:
  `configPath` becomes `undefined` and its settings are lost. An inline base never triggers a second pass.
  `inlineConfig.build.base = ''` clears a default base; `null` is ignored and the default base applies via a second
  pass.
- Without `baseRelDir` there is no second pass; the first pass's base is still `buildDir` and `build.base`.

### 6.4 Build directory

`buildDir` is the final base, else R. When it differs from R it must be an existing directory, else
`Base directory does not exist: <absolute base>` (also when it is a file).

### 6.5 Reading

- A chosen path that does not exist: `Configuration file does not exist`.
- A read failure: `Could not read configuration file\n<fs message>` (the fs error object, `code` kept). A directory
  gives `EISDIR: illegal operation on a directory, read`.

### 6.6 TOML parsing

- The file is read as UTF-8, pre-checked (below), then parsed as TOML 1.0. Failures:
  `Could not parse configuration file\n<parser message>`, where the parser message includes a code frame, e.g.
  `Invalid TOML document: incomplete key-value: cannot find end of key\n\n1:  "\n    ^`. Duplicate keys and integers
  outside the safe range are parse errors.
- The result is converted to plain JSON: plain prototypes; dates and times become ISO strings (`1979-05-27T07:32:00Z` →
  `"1979-05-27T07:32:00.000Z"`, local time → `"07:32:00.000"`); `nan` and `±inf` become `null`; `-0` becomes `0`.
- **Backslash pre-check.** Before parsing, the text is searched for the first key at the start of a line (letters only,
  directly after a newline) followed by `=` and a basic string containing a backslash that is not preceded by a
  backslash and not followed by one of `"` `\` `b` `t` `n` `f` `r` `u` `U`. In a `"…"` string the match is single-line
  and a line-ending backslash is invalid; in a `"""…"""` string it may span lines and a backslash before a newline is
  allowed. Literal strings are not checked. Exact pattern (flags `s`, `u`):
  `\n[a-zA-Z]+ *= *(?:(?:""".*(?<!\\)(\\[^"\\btnfruU\n]).*""")|(?:"(?!")[^\n]*(?<!\\)(\\[^"\\btnfruU])[^\n]*"))` On a
  match:
  `In netlify.toml, the following backslash should be escaped: <seq>\nThe following should be used instead: \<seq>`,
  where `<seq>` is the backslash and the next character (for a line-ending backslash, `\` and a newline). The text names
  `netlify.toml` whatever the file name.
- Pre-check gaps (one line each; such keys fall through to the parser's `unrecognized escape sequence` error): keys on
  the first line, indented keys, keys with `_`, digits, `-`, dots or quotes, values inside arrays or inline tables. The
  multi-line branch can span two `"""` strings and flag a literal string in between. `\x`, `\e` are always flagged.

## 7. Contexts

### 7.1 Selection

- Names checked, in order: `context`, then `branch`. For each non-empty name:
  - if `context` has an own entry `name`, only that entry applies;
  - otherwise every entry whose key ends with `*` and whose key without the final `*` is a prefix of the name applies,
    in key order (later wins). It is not "most specific wins". `*` alone matches every name. Wildcards apply to the
    context name too.
- Entries are own properties: a name equal to an `Object.prototype` member (`constructor`, `toString`, …) without its
  own entry falls back to wildcard matching like any other name.
- The same entry may apply twice (context equal to branch); this is idempotent.
- Entries are merged per §8 default mode: arrays replaced, objects deep-merged, plugins merged by package. The `context`
  key is then removed from the merged default+file config.

### 7.2 Build namespacing of an entry

Entry keys are processed in order:

- `base`, `command`, `environment`, `ignore`, `processing`, `publish` go under `build`.
- `functions` goes under `build` unless it is a plain object (then it is top-level function config).
- `edge_functions` goes under `build` unless it is an array (then top-level declarations).
- Other keys stay top-level, including an explicit `build` key.
- A later `build` key replaces build properties collected before it **(quirk)**: in TOML, `[context.x] command="a"` with
  `[context.x.build] publish="b"` loses `command`.
- Capitalized keys at the entry level (`Command`) are not namespaced and end up as unknown top-level properties.
- A non-object `functions` becomes `build.functions` and later fails `functions.directory must be a string.`

### 7.3 Inline contexts

`inlineConfig.context` is validated per source but never selected. It is kept verbatim as `config.context` (with origins
added and, in memory, `undefined`-valued lowercase build keys) **(quirk)**.

### 7.4 UI-installed plugins configured in a context

Runs before selection, over every context entry of the merged default+file config in key order, and each plugin of each
entry in order, when the merged top-level plugins contain the same `package` with `origin === 'ui'` (a package also
listed at the file's top level has merged origin `config` and is exempt):

- If the entry key differs from both `context` and `branch` (exact comparison) and the plugin's `inputs` is absent,
  `null` or `{}`, the user error is:
  ```
  \n"<pkg>" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.\nTo run "<pkg>" in the <entryKey> context only, uninstall the plugin from the site plugins list.\nTo run "<pkg>" in all contexts, please remove the following section from "netlify.toml".\n\n  [[context.<entryKey>.plugins]]\n  package = "<pkg>"\n
  ```
- Otherwise the warning:
  ```
  \n"<pkg>" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.\nTo run "<pkg>" in the <entryKey> context only, uninstall the plugin from the site plugins list.
  ```
- A wildcard entry key never equals the context or branch, so it always throws without inputs **(quirk)**.
- Warnings for earlier entries are logged before a later entry throws.

### 7.5 Plugins in contexts

Context plugins merge into top-level plugins by `package`, context values winning for `inputs`. A package only in a
context is appended after existing packages. Top-level-only plugins are kept.

## 8. Merging (`mergeConfigs`)

`mergeConfigs(configs, { concatenateArrays? })` returns a new merged object. It does not validate.

- Each input is first stripped of top-level keys whose value is `undefined` or `null`, and of the same keys in `build`;
  a `build` that is not a plain object (missing, `null`, a string, an array, …) becomes `{}`. So the result always has
  `build` (at least `{}`), except that an empty input list returns `{}`.
- `null` or `undefined` at the top level or directly in `build` never override. Deeper `null` does override. Blank
  strings do override (they are removed later, §9.5).
- Inputs are deep-merged left to right; later wins. Plain objects merge by key union. On a type mismatch the later value
  replaces the earlier.
- **Arrays, default mode**: a later array replaces an earlier one, at any depth. Exception: when both arrays consist
  only of plain objects with a string `package` ("plugin-like"), items are grouped by `package` in first-appearance
  order (earlier configs first, new packages appended) and each group is deep-merged in order. The merged item's
  `origin` is the last source's. Detection is by shape at any depth, and an empty array is plugin-like, so a later
  `plugins: []` does not clear earlier plugins **(quirk)**.
- **`concatenateArrays: true`**: every array at any depth, including `plugins`, becomes `[...later, ...earlier]`; with
  three inputs `[a, b, c]` the order is `c, b, a`. No grouping by package.

## 9. Normalization

### 9.1 Per-source pipeline

Each source (file, `defaultConfig`, `inlineConfig`) and then each of its context entries (after §7.2 namespacing) goes
through, in order: pre-case validation (§10.1), case normalization (§9.2), pre-merge validation, file-only validation
(file and its contexts), origins (§9.3), duplicate-plugin check (§9.6). Top-level sources then run the pre-context
validation and process their context entries with the same origin.

### 9.2 Case normalization

- If `build` is not `undefined`/`null` it is used and `Build` is discarded entirely; otherwise `Build` is used. A
  non-object `Build` is spread (a string gives index keys in `build`) and is not validated.
- In the chosen build, `Base`, `Command`, `Edge_functions`, `Environment`, `Functions`, `Ignore`, `Processing`,
  `Publish` map to lowercase; the lowercase key wins when not `undefined` (a lowercase `null` still wins). No other
  spelling or key is normalized. Other top-level keys (`Plugins`, `Context`) pass through as unknown properties.

### 9.3 Origins

Each source is tagged once, before merging: file and its contexts `config`; `defaultConfig` (including UI settings and
UI plugins) and its contexts `ui`; `inlineConfig` (including mutations) and its contexts `inline`.

- `build.commandOrigin = tag` iff `build.command` is present, overwriting any caller-supplied value (a caller's
  `'default'` becomes `'ui'`). Without a command, a caller-supplied `commandOrigin` is kept.
- `build.publishOrigin = tag` iff `build.publish` is present (not type-checked here).
- Each plugin gets `origin = tag` unless it has an own `origin` key, which is kept (including values outside the enum,
  such as `'default'`). An own `origin: undefined` is later removed, leaving the plugin without `origin`.
- `headersOrigin = tag` iff `headers` is present; `redirectsOrigin = tag` iff `redirects` is present. `[]`, `false` and
  strings count. `_headers`/`_redirects` files give no origin.
- Origins merge like other values, so the final origin is that of the highest layer that set a present value.
- A higher layer setting `command` or `publish` to a blank string erases the value (§9.5) but not the lower layer's
  origin: e.g. `commandOrigin: 'ui'` with no command, or a default publish with `publishOrigin: 'ui'` **(quirk)**.

### 9.4 Defaults

Merged under the merged config (§8 rules):

```
build: { environment: {}, publish: <packagePath if present, else '.'>, publishOrigin: 'default',
         processing: { css: {}, html: {}, images: {}, js: {} }, services: {} }
functions: { '*': {} }
plugins: []
```

`publishOrigin` is `'default'` exactly when no layer gave a present publish and no stale origin remains (§9.3).

### 9.5 Blank removal and plugins

- Before defaults, top-level and `build` keys that are empty are deleted. So `command = "  "` gives no command and no
  origin; a blank in a higher source erases a lower value; `publish = ""` falls back to the default.
- Each plugin: `inputs` defaults to `{}` only when `undefined`; then every empty property of the plugin is deleted. So
  `inputs: null` leaves no `inputs`, and `package: ''` leaves no `package` (reported as "required", §10.3 #12).

### 9.6 Duplicate plugins

Per source and per context entry, after origins: two plugins with the same `package` and the same `origin` (strict
equality) throw `Plugin "<String(package)>" must not be specified twice in <place>` for the first one that has a later
duplicate. `<place>` is `netlify.toml` for `config`, `the app` for `ui`, and the literal `undefined` for any other
origin, including `inline` **(quirk)** and names such as `toString`. UI plugins and `defaultConfig.plugins` form one
source. Two plugins without `package` give `Plugin "undefined" …`. Duplicates across sources are merged (§8).

### 9.7 Functions

After merging:

- `build.functions` is removed from `build` and becomes the v1 directory candidate.
- Top-level `functions` keys other than `'*'`, in order: a key that is one of `deno_import_map`, `directory`,
  `external_node_modules`, `ignored_node_modules`, `included_files`, `memory`, `node_bundler`, `region`, `schedule`,
  `vcpu`, whose value is not a "config leaf" (a plain object whose keys are all in that list; `{}` qualifies), is moved
  into `'*'`. Existing `'*'` values win over moved ones. Any other key is a function name or glob.
  `functions.directory = {}` defines a function named `directory` **(quirk)**.
- A `null` `'*'` stays `null` for validation (§10.3 #23); a non-object `'*'` is spread.
- `'*'.directory` is removed from `'*'`. Named entries come first, `'*'` last.
- `functionsDirectory`: `'*'.directory` if not nullish, origin `config`; else `build.functions` if not nullish, origin
  `config-v1`; else an existing top-level `functionsDirectory` with its origin (for example `ui`); else a default
  directory (§11.4). The origin is `config`/`config-v1` whichever layer set it **(quirk)**. `functions.directory = ""`
  sets origin `config`, then path resolution deletes the directory **(quirk)**.

### 9.8 Other keys

All other top-level keys (unknown properties, spread option indices, top-level `edge_functions` declarations, `dev`,
`images`, `integrations`, `db`) pass through unchanged.

## 10. Validation

### 10.1 Stages

| Key | Stage          | Input                                                     |
| --- | -------------- | --------------------------------------------------------- |
| PC  | pre-case       | each raw source and context entry; only lowercase `build` |
| PM  | pre-merge      | case-normalized source/entry                              |
| CF  | config file    | file and its context entries only                         |
| PX  | pre-context    | each top-level source                                     |
| PN  | pre-normalize  | merged config, before defaults and §9.5                   |
| N   | post-normalize | normalized config                                         |
| W   | lenient        | normalized config; warns only (§10.4)                     |

- Only one error is reported. Earlier stages win. Within a stage, the first failing rule in table order wins; ties go to
  the first offending element in array-index or key order. An object failing a rule hides its children.
- Every context entry is validated, whether or not it applies. Labels in a context entry are relative to the entry:
  `[context.dev] command = true` reports `build.command`, with invalid syntax `[build] command = true` **(quirk)**.
- Inline context entries pass PC–PX only; N never sees them.
- A rule is skipped when the value or its parent is `undefined`. `null` fails type rules, except where §9.5 removed it
  before N (top-level, `build.*`, plugin level). `false` and `0` are validated. In `functions.<name>.*` and
  `edge_functions[i].*` nothing is removed.

### 10.2 Message format

```
Configuration property <LABEL> <MESSAGE>\n\nInvalid syntax\n\n<INVALID indented 2>\n\nValid syntax\n\n<EXAMPLE indented 2>
```

- Colours when enabled: `Configuration property` cyan, `Invalid syntax` red bold, `Valid syntax` cyan bold.
- LABEL: the rule's override, or the path: first segment as is, later keys as `.key`, array indexes as `[i]`
  (`plugins[0].package`, `functions.*.memory`, `edge_functions[1]`).
- INVALID: the offending value wrapped in its path from the innermost segment out (an index wraps as `[child]`, a key as
  `{ key: child }`), serialized as TOML (§16.3 format; `null` omitted, so `build.command = null` shows `[build]`). At N
  the value is the normalized one, so plugin errors show `origin = "config"` and an empty `[plugins.inputs]`, and
  top-level function props appear under `[functions."*"]`.
- EXAMPLE: the rule's example, serialized the same way. Indentation adds 2 spaces to non-empty lines.
- An exception while checking or formatting becomes a user error with its own message (e.g. `vcpu = NaN` gives
  `functions.a.vcpu: Number must be finite.`).

### 10.3 Rules

Examples are JS objects; `<n>` is the function name (`*` for top-level props).

| #   | Stage  | Label                                                                                     | Fails when                                                                                                                                         | Message                                                                                                                                                                  | Example                                                                               |
| --- | ------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 1   | PC     | `build`                                                                                   | not plain object                                                                                                                                   | `must be a plain object.`                                                                                                                                                | `{build:{command:'npm run build'}}`                                                   |
| 2   | CF     | `edge_functions[i]` / `edge_functions.<k>`                                                | a plain-object entry has a key outside the 9 names below (non-object entries and non-array/object `edge_functions` ignored)                        | `has unknown properties. Valid properties are:\n  - path\n  - excludedPath\n  - pattern\n  - excludedPattern\n  - function\n  - cache\n  - method\n  - header\n  - name` | `{edge_functions:[{path:'/hello',function:'hello'}]}`                                 |
| 3   | PM, PN | `build.command`                                                                           | not string                                                                                                                                         | `must be a string`                                                                                                                                                       | `{build:{command:'npm run build'}}`                                                   |
| 4   | PM, PN | `plugins`                                                                                 | not array of plain objects                                                                                                                         | `must be an array of objects.`                                                                                                                                           | `{plugins:[{package:'netlify-plugin-one'},{package:'netlify-plugin-two'}]}`           |
| 5   | PX     | `context`                                                                                 | not plain object                                                                                                                                   | `must be a plain object.`                                                                                                                                                | `{context:{production:{publish:'dist'}}}`                                             |
| 6   | PX     | `context.<name>`                                                                          | not plain object                                                                                                                                   | `must be a plain object.`                                                                                                                                                | `{context:{<name>:{publish:'dist'}}}`                                                 |
| 7   | PN     | `functions`                                                                               | not plain object                                                                                                                                   | `must be an object.`                                                                                                                                                     | `{functions:{external_node_modules:['module-one','module-two']}}`                     |
| 8   | PN     | `edge_functions`                                                                          | not array of plain objects                                                                                                                         | `must be an array of objects.`                                                                                                                                           | `{edge_functions:[{path:'/hello',function:'hello'},{path:'/auth',function:'auth'}]}`  |
| 9   | PN     | `database`                                                                                | not plain object                                                                                                                                   | `must be a plain object.`                                                                                                                                                | `{database:{migrations:{path:'netlify/database/migrations'}}}`                        |
| 10  | PN     | `database.migrations`                                                                     | not plain object                                                                                                                                   | `must be a plain object.`                                                                                                                                                | as #9                                                                                 |
| 11  | N      | `plugins[i]`                                                                              | key other than `package`, `pinned_version`, `inputs`, `origin`                                                                                     | `has unknown properties. Valid properties are:\n  - package\n  - pinned_version\n  - inputs`                                                                             | `{plugins:[{package:'netlify-plugin-one',inputs:{port:80}}]}`                         |
| 12  | N      | `plugins[i]`                                                                              | no `package`                                                                                                                                       | `"package" property is required.`                                                                                                                                        | `{plugins:[{package:'netlify-plugin-one'}]}`                                          |
| 13  | N      | `plugins[i].package`                                                                      | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | as #12                                                                                |
| 14  | N      | `plugins[i].package`                                                                      | not starting with `.` or `/` and not a valid (legacy rules) npm package name: versions, URIs, `git@…`, drive paths fail; uppercase and scopes pass | `must be a npm package name only.`                                                                                                                                       | as #12                                                                                |
| 15  | N      | `plugins[i].pinned_version`                                                               | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{plugins:[{package:'netlify-plugin-one',pinned_version:'1'}]}`                       |
| 16  | N      | `plugins[i].inputs`                                                                       | not plain object                                                                                                                                   | `must be a plain object.`                                                                                                                                                | `{plugins:[{package:'netlify-plugin-one',inputs:{port:80}}]}`                         |
| 17  | N      | `build.base`                                                                              | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{build:{base:'packages/project'}}`                                                   |
| 18  | N      | `build.publish`                                                                           | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{build:{publish:'dist'}}`                                                            |
| 19  | N      | `build.functions`                                                                         | not string (unreachable, see §9.7)                                                                                                                 | `must be a string.`                                                                                                                                                      | `{build:{functions:'functions'}}`                                                     |
| 20  | N      | `build.ignore`                                                                            | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{build:{ignore:'ignore'}}`                                                           |
| 21  | N      | `build.edge_functions`                                                                    | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{build:{edge_functions:'edge-functions'}}`                                           |
| 22  | N      | `spa_fallback`                                                                            | not boolean                                                                                                                                        | `must be a boolean.`                                                                                                                                                     | `{spa_fallback:true}`                                                                 |
| 23  | N      | `functions.<n>`                                                                           | not plain object                                                                                                                                   | `must be an object.`                                                                                                                                                     | `{functions:{<n>:{external_node_modules:['module-one','module-two']}}}`               |
| 24  | N      | `functions.<n>.deno_import_map`                                                           | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{functions:{<n>:{deno_import_map:'path/to/import_map.json'}}}`                       |
| 25  | N      | `functions.<n>.external_node_modules`                                                     | not array of strings                                                                                                                               | `must be an array of strings.`                                                                                                                                           | `{functions:{<n>:{external_node_modules:['module-one','module-two']}}}`               |
| 26  | N      | `functions.<n>.ignored_node_modules`                                                      | not array of strings                                                                                                                               | `must be an array of strings.`                                                                                                                                           | `{functions:{<n>:{ignored_node_modules:['module-one','module-two']}}}`                |
| 27  | N      | `functions.<n>.included_files`                                                            | not array of strings                                                                                                                               | `must be an array of strings.`                                                                                                                                           | `{functions:{<n>:{included_files:['directory-one/file1','directory-two/**/*.jpg']}}}` |
| 28  | N      | `functions.<n>.node_bundler`                                                              | not `esbuild`, `nft`, `zisi`, `none`                                                                                                               | `must be one of: esbuild, nft, zisi, none`                                                                                                                               | `{functions:{<n>:{node_bundler:'esbuild'}}}`                                          |
| 29  | N      | `functions.<n>.directory`                                                                 | defined (incl. `null`) on a named function                                                                                                         | ``must be defined on the main `functions` object.``                                                                                                                      | `{functions:{directory:'my-functions'}}`                                              |
| 30  | N      | `functions.<n>.memory`                                                                    | not number and not string (no unit check; `NaN`, `Infinity`, negatives pass)                                                                       | `must be a number (in MB) or a string with a unit (e.g. "2gb").`                                                                                                         | `{functions:{<n>:{memory:'2gb'}}}`                                                    |
| 31  | N      | `functions.<n>.region`                                                                    | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{functions:{<n>:{region:'cmh'}}}`                                                    |
| 32  | N      | `functions.<n>.vcpu`                                                                      | not a number in `[0.5, 2]`                                                                                                                         | `must be a number between 0.5 and 2.`                                                                                                                                    | `{functions:{<n>:{vcpu:1.5}}}`                                                        |
| 33  | N      | `functions.<n>.schedule`                                                                  | not a valid cron expression (falsy values, `@daily`, arrays of predefined names and 6-field expressions pass; `5` fails)                           | `must be a valid cron expression (see https://ntl.fyi/cron-syntax).`                                                                                                     | `{functions:{<n>:{schedule:'5 4 * * *'}}}`                                            |
| 34  | N      | `functions.directory` (value: `functionsDirectory`, shown as `{functions:{directory:…}}`) | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{functions:{directory:'my-functions'}}`                                              |
| 35  | N      | `database.migrations.path`                                                                | not string                                                                                                                                         | `must be a string.`                                                                                                                                                      | `{database:{migrations:{path:'netlify/database/migrations'}}}`                        |

Edge function declarations, N stage, each `edge_functions[i]`, after #35. `cache` values: `manual`, `off`. Methods:
`GET, POST, PUT, PATCH, DELETE, OPTIONS`. `E` = `{edge_functions:[{path:'/hello',function:'hello'}]}`.

| #   | Label               | Fails when                                                      | Message                                                                                 | Example                                                                                                                                                         |
| --- | ------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 36  | `edge_functions[i]` | key outside the #2 names plus `generator`                       | `has unknown properties. Valid properties are:` + the 9 lines of #2 + `\n  - generator` | E                                                                                                                                                               |
| 37  | `edge_functions[i]` | `path` and `pattern` both undefined                             | `either "path" or "pattern" is required.`                                               | E                                                                                                                                                               |
| 38  | `edge_functions[i]` | `path` and `pattern` both defined                               | `"path" and "pattern" are mutually exclusive.`                                          | E                                                                                                                                                               |
| 39  | `edge_functions[i]` | `excludedPath` and `excludedPattern` both defined               | `"excludedPath" and "excludedPattern" are mutually exclusive.`                          | `{edge_functions:[{path:'/hello/*',function:'hello',excludedPath:'/hello/no'}]}`                                                                                |
| 40  | `edge_functions[i]` | `function` undefined                                            | `"function" property is required.`                                                      | E                                                                                                                                                               |
| 41  | `.path`             | not string                                                      | `must be a string.`                                                                     | E                                                                                                                                                               |
| 42  | `.excludedPath`     | not string or string array                                      | `must be a string or array of strings.`                                                 | `{edge_functions:[{path:'/products/*',excludedPath:['/products/*.jpg'],function:'customise'}]}`                                                                 |
| 43  | `.pattern`          | not string                                                      | `must be a string.`                                                                     | `{edge_functions:[{pattern:'/hello/(.*)',function:'hello'}]}`                                                                                                   |
| 44  | `.excludedPattern`  | not string or string array                                      | `must be a string or array of strings.`                                                 | `{edge_functions:[{path:'/products/(.*)',excludedPattern:['^/products/(.*)\\.jpg$'],function:'customise'}]}`                                                    |
| 45  | `.function`         | not string                                                      | `must be a string.`                                                                     | E                                                                                                                                                               |
| 46  | `.name`             | not string                                                      | `must be a string.`                                                                     | `{edge_functions:[{path:'/hello',function:'hello',name:'Hello'}]}`                                                                                              |
| 47  | `.generator`        | not string                                                      | `must be a string.`                                                                     | `{edge_functions:[{path:'/hello',function:'hello',generator:'package-name@1.2.3'}]}`                                                                            |
| 48  | `.path`             | does not start with `/`                                         | `must be a valid path.`                                                                 | E                                                                                                                                                               |
| 49  | `.cache`            | not `manual` or `off`                                           | `must be one of: manual, off`                                                           | `{edge_functions:[{cache:'manual',path:'/hello',function:'hello'}]}`                                                                                            |
| 50  | `.method`           | not a method (case-insensitive) or a non-empty array of methods | `must be one of or array of: GET, POST, PUT, PATCH, DELETE, OPTIONS`                    | `{edge_functions:[{method:['PUT','DELETE'],path:'/hello',function:'hello'}]}`                                                                                   |
| 51  | `.header`           | not a plain object with boolean or string values                | `must be an object with string keys and boolean or string values.`                      | `{edge_functions:[{path:'/hello',function:'hello',header:{'x-must-be-present':true,'x-must-not-be-present':false,'x-must-match-value':'^(value1\|value2)$'}}]}` |

`generator` is rejected in `netlify.toml` (#2, contexts included) and accepted from `defaultConfig`, `inlineConfig` and
mutations. The Frameworks API relies on this.

### 10.4 Lenient normalized-shape warning

After N passes, the normalized config is checked against a loose shape mirroring the declared result type (extra keys
allowed): the §1.3.1 invariants, the types of §10.3, origins in `ui|config|default|inline` (`functionsDirectoryOrigin`
also `config-v1|default-v1`), records for `build.environment`, `build.services`, `build.processing.*` and `dev`,
`integrations[]` of `{ name: string, dev?: { path: string, force_run_in_build?: boolean } }`, and finite numbers.
`schedule` may be any value, so it never warns. On mismatch it logs `Unexpected configuration, used as is:\n<issues>`;
the config is unchanged. Values valid under §10.3 that still trigger it: `NaN` or `Infinity` memory, `inputs: null`, a
plugin origin outside the enum.

## 11. Paths

### 11.1 Resolution rule

A path value is resolved as `resolve(baseRel, value without leading slashes)`: `/dist` → `baseRel/dist`, `/` → baseRel.
`build.base` always resolves against R with prop name `build.base`.

### 11.2 Inside the repository root

Every resolved path must be inside R (relative path from R not starting with `..`, same filesystem root), else
`Configuration property "<prop>" "<original value>" must be inside the repository root directory.` The original value
keeps its leading slashes. A directory directly in R whose name starts with `..` is rejected **(quirk)**. Paths outside
the build directory but inside R are allowed.

### 11.3 Resolved properties

In this order (which decides the reported error): `functionsDirectory`, `functions['*'].deno_import_map`,
`build.publish`, `build.edge_functions`, `database.migrations.path`. Prop names in errors are `functionsDirectory`,
`functions.*.deno_import_map`, `build.publish`, `build.edge_functions`, `database.migrations.path`. Nothing else is
resolved (named functions' `deno_import_map`, `included_files`, plugin packages, edge declarations, `dev.*`, `db.*` stay
as written). An empty value is deleted and its parent kept (`database.migrations` stays `{}`).

- Publish default: `packagePath` if present, else `.`, then resolved; so `join(baseRel, packagePath)` or baseRel. The
  second pass has no `packagePath`, so its default publish is the base.
- `baseRelDir` false: paths resolve against R while `buildDir` and `build.base` are still the base.

### 11.4 Default directories

Each candidate is `resolve(join(baseRel, packagePath ?? ''), <dir>)`, added only if it exists (a file counts
**(quirk)**) and the merged config set nothing for it:

| Directory                     | Sets                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `netlify/functions`           | `functionsDirectory`, `functionsDirectoryOrigin: 'default'`                                            |
| `netlify-automatic-functions` | `functionsDirectory`, `functionsDirectoryOrigin: 'default-v1'` (only if `netlify/functions` is absent) |
| `netlify/edge-functions`      | `build.edge_functions`                                                                                 |
| `netlify/database/migrations` | `database.migrations.path`                                                                             |

Defaults are checked inside R with prop names `functions.directory`, `build.edge_functions`, `database.migrations.path`.
With `functions.directory = ""` and `netlify/functions` present, the result is the default directory with origin
`config` **(quirk)**.

### 11.5 `build.base`

Set to the resolved base (absolute). When there is no base the key exists with value `undefined` (JSON omits it).

## 12. Headers and redirects

### 12.1 Paths

`headersPath = <build.publish>/_headers`, `redirectsPath = <build.publish>/_redirects`, always set, using the final
publish. These files are not searched elsewhere.

### 12.2 Merge

- `config.headers`: entries parsed from `_headers` (none if missing), then the merged config `headers`; invalid entries
  dropped with warnings; exact duplicates (same `for` and `values`, key order ignored) removed keeping the last. Entries
  with the same path are not merged. Minimal shape `{ for, values }`. A non-array config `headers` gives a parse error
  message `Headers must be an array not: <value>` and no config headers; `headersOrigin` is still set.
- `config.redirects`: `_redirects` entries first, then config `redirects`, same rules (duplicates by stable
  serialization, last kept). Minimal shape: `from`, `query`, `to`, `status?`, `force`, `conditions`, `signed?`,
  `headers` (no `scheme`, `host`, `path`, `proxy`).
- Config arrays replace each other across layers (§8), so only the highest layer's `headers`/`redirects` are used.
- Header and redirect problems, including unreadable files, are warnings, never errors.

### 12.3 Warnings

- Syntax errors: `\nWarning: some headers have syntax errors:\n\n<m1>\n\n<m2>…` and
  `\nWarning: some redirects have syntax errors:\n\n<m1>\n\n<m2>…`, where `<mN>` are the parsers' messages, e.g.
  `Could not parse redirect number N:\n  <json>\nMissing "to" field` or `Could not read headers file: <path>`.
- Case duplicates, at most once per pass:
  `\nWarning: the same header is set twice with different cases<for>: "<A>" and "<B>"`. From every `(for, name)` pair,
  keep only the last occurrence of each exact name; `<B>` is the first name with a later case-insensitive equal; `<A>`
  is the first name that differs from `<B>` exactly but equals it ignoring case; `<for>` is ` for "<path>"` when both
  share `for`, else empty. Because of cross-path deduplication, `/a {test, Test}` plus `/b {test}` warns without
  ` for "/a"` **(quirk)**.

## 13. Environment variables (`result.env`)

### 13.1 Shape

`Record<name, { sources: Source[], value: string }>`, with `Source` one of `configFile`, `ui`, `account`, `general`,
`internal` (these exact strings). `sources` lists every source setting the name, highest first; `value` comes from the
first. With `mode === 'buildbot'`, `env` is `{}` (cached internal variables included).

### 13.2 Sources, highest first

| Source       | Values                                                                                 |
| ------------ | -------------------------------------------------------------------------------------- |
| `configFile` | resolved `config.build.environment` (after contexts, inline, mutations)                |
| `ui`         | `siteInfo.build_settings.env` (`{}` if missing/null); envelope result in envelope mode |
| `account`    | §13.3                                                                                  |
| `general`    | §13.6                                                                                  |
| `internal`   | §13.5                                                                                  |

- `configFile`, `ui` and `account` have these names removed (exact, case-sensitive): `BRANCH`, `CACHED_COMMIT_REF`,
  `COMMIT_REF`, `CONTEXT`, `HEAD`, `REPOSITORY_URL`, `URL`, `NETLIFY`, `NETLIFY_LOCAL`, `INCOMING_HOOK_BODY`,
  `INCOMING_HOOK_TITLE`, `INCOMING_HOOK_URL`, `NETLIFY_BUILD_BASE`, `NETLIFY_BUILD_LIFECYCLE_TRIAL`,
  `NETLIFY_IMAGES_CDN_DOMAIN`, `PULL_REQUEST`, `REVIEW_ID`.
- Other general names (`SITE_ID`, `DEPLOY_URL`, `LANG`, …) can be overridden by users **(quirk)**.
- A key counts as present even when its value is `''`, `null` or `undefined`. Strings are kept, numbers and booleans
  stringified (`3.9` → `'3.9'`); `null`/`undefined` stay as they are. `''` from the file is kept.
- Key order: first appearance across sources in precedence order.

### 13.3 Account source

- With `siteInfo.use_envelope` truthy: `{}` without an API client; otherwise an account-scoped envelope request (§13.4)
  without `site_id`.
- Otherwise: `site_env` of the account whose `slug === siteInfo.account_slug`, else `{}`.

### 13.4 Envelope

- `GET …/accounts/<siteInfo.account_slug>/env?context_name=<context>[&site_id=<siteId>]` (raw `context`). No request and
  `{}` when `account_slug` is undefined.
- Variables are sorted by `key` case-insensitively; the value is the first entry of `values` whose `context` is `all` or
  equals `context`, in array order. Variables with no key, no matching value or an empty value are dropped.
  `branch`-scoped values only match when `context === 'branch'`.
- Every failure is swallowed silently and gives `{}`.

### 13.5 Internal source

Only on re-resolution with a cache (§5.6): every cached `env` entry whose `sources` includes `internal` contributes its
cached `value` (even when `internal` was not its first source). Lowest precedence, not filtered. netlify-cli relies on
this to carry its own variables into @netlify/build.

### 13.6 General source

Entries with empty values are omitted.

| Variable                                               | Value                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `SITE_ID`                                              | `siteInfo.id`                                                             |
| `SITE_NAME`                                            | `siteInfo.name`                                                           |
| `DEPLOY_ID`                                            | `deployId`                                                                |
| `NETLIFY_SKEW_PROTECTION_TOKEN`                        | `skewProtectionToken`                                                     |
| `BUILD_ID`                                             | `buildId`                                                                 |
| `ACCOUNT_ID`                                           | `siteInfo.account_id`                                                     |
| `URL`                                                  | `siteInfo.ssl_url`                                                        |
| `REPOSITORY_URL`                                       | `siteInfo.build_settings.repo_url` (none when `build_settings` is `null`) |
| `DEPLOY_PRIME_URL`                                     | `https://<branch>--<name>.netlify.app`                                    |
| `DEPLOY_URL`                                           | `https://<deployId>--<name>.netlify.app`                                  |
| `CONTEXT`                                              | `context`                                                                 |
| `NETLIFY_LOCAL`                                        | `'true'`                                                                  |
| `BRANCH`, `HEAD`                                       | `branch`                                                                  |
| `COMMIT_REF`                                           | the HEAD commit of `buildDir`'s repository                                |
| `CACHED_COMMIT_REF`                                    | the first parent of that commit                                           |
| `PULL_REQUEST`                                         | `'false'`                                                                 |
| `LANG`, `LC_ALL`                                       | `'en_US.UTF-8'`                                                           |
| `LANGUAGE`                                             | `'en_US:en'`                                                              |
| `GATSBY_TELEMETRY_DISABLED`, `NEXT_TELEMETRY_DISABLED` | `'1'`                                                                     |

`<name>` is `siteInfo.name`, `'site-name'` when `undefined` (`null` gives `null`). A failing git command omits its
variable. Branch and deploy ID are not sanitized.

## 14. Extensions

### 14.1 `result.integrations`

An array of `{ author, buildPlugin, dev, extension_token, has_build, name, slug, version }`.

- API extensions (§4.2, §4.5, reused cache, or §14.4) are keyed by `slug` (a duplicate keeps its first position and the
  last value). `buildPlugin` is `{ origin: 'remote', packageURL: new URL('/packages/buildhooks.tgz', version) }` when
  `has_build`, else `null`. `packageURL` is a `URL` instance. A non-URL `version` with `has_build` throws a bug
  `TypeError: Invalid URL`.
- Dev extensions come from `config.integrations` only when `context === 'dev'`, keyed by `name` (last wins). Each has
  `dev`, `name = slug = name`, `buildPlugin` from §14.2, `has_build = buildPlugin !== null`. They need not exist in the
  API.
- Merge per slug, API slugs first then dev-only names in config order: `author`, `extension_token`, `version` from the
  API else `''`; `buildPlugin` dev, else API, else `null`; `has_build` dev, else API, else `false`; `name`, `slug` dev,
  else API, else `''`; `dev` the dev object or `undefined`. `force_run_in_build` is passed through in `dev`.

### 14.2 Dev build plugin

No or empty `dev.path` gives `null`. Otherwise the path resolves against `buildDir` (absolute kept); with no file
extension it is a directory and `/.ntli/site/static/packages/buildhooks.tgz` is appended. The result is
`{ origin: 'local', packageURL: new URL('file://' + path) }`, without existence check. A directory name with a dot is
treated as a file; `#` and `?` in the path become URL parts **(quirk)**.

### 14.3 Tarball check

Any merged entry whose non-null `buildPlugin` URL has an extension other than `.tgz` (case-insensitive) throws
`Extension <slug> contains unexpected build plugin URL: '<url>'. Build plugin URLs must end in '.tgz'.` No prefix.

### 14.4 Auto-install

Runs after env resolution in every mode. Never throws. Every message goes through the logger (§18). `<inspected x>` is
`x` formatted by Node's `util.format` after a space (an `Error` shows its stack).

1. Skipped unless `auto_install_required_extensions_v2` is truthy.
2. Skipped when `accountId`, `siteId` or `token` is missing, or `offline`. With `debug`, first the warning
   `Failed to auto install extension(s): <reason><inspected { accountId, siteId, buildDir, offline, mode }>` with reason
   `Missing accountId`, `Missing siteId`, `Missing token` or `Running as offline`.
3. Reads `dependencies` (own keys, not `devDependencies`) of `<buildDir>/package.json`, cached per process **(quirk)**.
   Missing or unparsable: skipped.
4. `GET <EXTENSION_API_BASE_URL from process.env, default https://api.netlifysdk.com>/meta/auto-installable` (ignores
   `host` and `testOpts`). Failure (network, JSON, or a non-OK status, message `Failed to fetch extensions meta`): the
   warning `Failed to fetch auto-installable extensions meta: <message><inspected error>` and empty metadata. The body
   is checked leniently (description `auto-installable extensions from the extension API`; array of
   `{ slug, hostSiteUrl: string, packages: string[] }`).
5. Candidates: metadata entries whose `slug` is not installed and whose `packages` include a dependency.
6. Per candidate in parallel, the plain (non-warning) log
   `Installing extension "<slug>" on team "<accountId>" required by package(s): "<p1>", "<p2>"` listing the candidate's
   `packages`, each quoted, joined by `, `; then `POST <hostSiteUrl>/.netlify/functions/handler/on-install` with body
   `{"teamId":"<accountId>"}`, headers `netlify-token: <token>` and the §4.5 `User-Agent`. OK or 409 succeeds; other
   statuses fail silently.
7. If any succeeded, extensions are fetched again (§4.5) and replace the list.
8. Any exception: the warning `Failed to auto install extension(s): <message><inspected error>`, original list kept.

## 15. Mutations (`applyMutations`)

### 15.1 Events

`EVENTS` is `['onPreBuild', 'onBuild', 'onPostBuild', 'onSuccess', 'onError', 'onEnd']`. `DEV_EVENTS` is
`['onPreDev', 'onDev']`. Both are plain mutable arrays; the order is semantic.

### 15.2 Application

`applyMutations(inlineConfig, configMutations)` applies each `{ keys: (string|number)[], value, event }` left to right;
later wins. Extra mutation properties are ignored. It is synchronous and never mutates its arguments. With `[]` it
returns `inlineConfig` itself, whatever it is.

### 15.3 Property names and mutability

The prop name joins the keys with `.`; a key becomes `*` when it is an integer number or when the name so far is
`build.services`, `build.environment`, `functions` or `functions.*`. A string `'0'` stays `'0'`. A mutation is allowed
only if its prop name is an own key of this table; otherwise `"netlifyConfig.<prop>" is read-only.`
(`"netlifyConfig." is read-only.` for `[]`).

| Prop name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Last event    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `build.command`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `onPreBuild`  |
| `build.functions`, `functions.*`, `functions.*.*`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `onBuild`     |
| `build.edge_functions`, `build.environment`, `build.environment.*`, `build.processing`, `build.processing.css`, `build.processing.css.bundle`, `build.processing.css.minify`, `build.processing.html`, `build.processing.html.pretty_urls`, `build.processing.images`, `build.processing.images.compress`, `build.processing.js`, `build.processing.js.bundle`, `build.processing.js.minify`, `build.processing.skip_processing`, `build.publish`, `build.services`, `build.services.*`, `edge_functions`, `headers`, `images`, `images.remote_images`, `redirects`, `spa_fallback` | `onPostBuild` |
| `dev`, `dev.processing`, `dev.processing.html`, `dev.processing.html.injections`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `onPreDev`    |

Arrays can only be replaced whole (`redirects.*` is read-only). `build.base`, `plugins`, `context`, `integrations`,
`functionsDirectory` and anything deeper than the table are read-only.

### 15.4 Event cut-off

With `i(x)` the index in `EVENTS` (−1 if absent), a mutation is rejected when `i(lastEvent) < i(event)`:
`"netlifyConfig.<prop>" cannot be modified after "<lastEvent>".` The read-only check runs first. Consequences:

- Dev events and unknown event names never reject build props; netlify-cli relies on this.
- Dev props are rejected during every build event, `onPreBuild` included, and accepted during `onDev`.
- `onSuccess`, `onError`, `onEnd` reject every build prop.

### 15.5 Writes

- Default: the value is set at the exact `keys` path and the top level is shallow-copied into a plain object. String
  keys write properties; integer keys write array indices (holes serialize to `null`). A missing or non-object
  intermediate is replaced by `{}` (string key) or `[]` (integer key). A non-object `inlineConfig` is discarded. A key
  containing a dot is written literally (`['build.command']` writes a top-level `"build.command"` key) **(quirk)**.
  `value` is stored as is, not validated here.
- `functions.<key>` (exactly two keys): if `<key>` is one of the §9.7 function config properties, the value is written
  to `functions['*'][<key>]` (existing `'*'` spread first); otherwise to `functions[<key>]`, replacing it.

## 16. `updateConfig` and `restoreConfig`

### 16.1 `updateConfig(configMutations, options)`

Options: `buildDir` (required), `configPath?`, `headersPath?`, `redirectsPath?`, `outputConfigPath?` (default
`configPath`), `context`, `branch`, `logs?`. Unknown options (such as `featureFlags`) are ignored.

With no mutations, it does nothing, not even creating directories. Otherwise, in order:

1. `applyMutations({}, configMutations)`. Rejections throw before any file is touched.
2. Context priority: with `{ build = {}, ...rest }` the result, write
   `{ ...rest, build, context: { ...rest.context, [context]: E, [branch]: E } }`, where
   `E = { ...rest without redirects, ...build, build }`. Build props appear at the entry's top level and under `build`;
   `redirects` stays top-level only; everything else is copied into both entries.
3. Read `configPath` if defined and existing, else `{}`. Errors use §6.5/§6.6 texts without prefix. The file is not
   validated.
4. `mergeConfigs([fileConfig, step2])` (default mode).
5. Headers and redirects: merged with the `_headers`/`_redirects` files per §12.2, warnings per §12.3 to `logs`.
6. Simplify (§16.4).
7. Back up (§16.2).
8. Concurrently: write the TOML (§16.3) to `outputConfigPath`; delete `headersPath` and `redirectsPath` if defined and
   existing.

Without both `configPath` and `outputConfigPath`, step 8's write throws the bug
`TypeError: updateConfig() needs configPath or outputConfigPath` after the backup. The TOML is written only to
`outputConfigPath`; `configPath` is what is backed up.

### 16.2 Backup and `restoreConfig(configMutations, { buildDir, configPath?, headersPath?, redirectsPath? })`

- Backup directory: `<buildDir>/.netlify/deploy` (created recursively), with fixed names `netlify.toml`, `_headers`,
  `_redirects`. For each: delete any existing backup (errors ignored), then copy the original if its path is defined and
  it exists.
- `restoreConfig` with no mutations does nothing. Otherwise, per pair concurrently: skip an undefined destination; if
  the backup exists, copy it over the destination (the backup is kept); else delete the destination (errors ignored). So
  calling it without a prior `updateConfig` deletes site files **(quirk)**. `outputConfigPath` is never restored.

### 16.3 TOML serialization

- Nested tables indented 2 spaces per level; arrays of tables as `[[headers]]`, `[[redirects]]`, `[[edge_functions]]`;
  the `*` key quoted (`[functions."*"]`); integers without `.0` (`status = 200`), floats kept; integers ≥ 1e21 as
  `1e+21`; `null`/`undefined` values dropped; an empty object gives an empty table header.
- A mixed-type array throws a bug `Error`: `<key>: Array cannot contain values of different types.`
- Each context entry contains the build props twice (§16.1 step 2).

### 16.4 Simplification

"Falsy" here means empty (§0); `false` and `0` are kept.

- Top-level falsy keys dropped.
- `functions`: if a plain object, each entry kept only if it is a plain object with a non-falsy property, falsy
  properties dropped; otherwise `functions` dropped.
- `build`: `environment` kept only if non-empty (a list of names when printing, else a plain object with falsy values
  removed; so a `''` env var is dropped from the written file **(quirk)**); `processing.css|html|images|js` kept only if
  plain objects with a non-falsy value; other processing keys minus falsy ones; `processing` dropped if empty;
  `services` kept only if a non-empty plain object; other build keys minus falsy ones; `build` dropped if empty.
- `plugins`, `headers`: kept only if non-empty arrays; items unchanged.
- `redirects`: kept only if a non-empty array. Each plain-object item loses `force` and `proxy` when `false`, and
  `query`, `conditions`, `headers` when not non-empty plain objects; other keys kept verbatim.
- `context`: each entry simplified recursively; an entry that becomes `{}` is kept (empty `[context.x]` table);
  `context` dropped only with no entries.
- Output key order: other keys in original order, then `functions`, `build`, `plugins`, `headers`, `redirects`,
  `context`. Inside `build`: other keys, then `environment`, `processing`, `services`.

## 17. Printing (`cleanupConfig`)

### 17.1 Allow-list

`cleanupConfig(config)` reads only: `build.base`, `build.command`, `build.commandOrigin`, `build.environment`,
`build.edge_functions`, `build.ignore`, `build.processing`, `build.publish`, `build.publishOrigin`, `headers`,
`headersOrigin`, `plugins`, `redirects`, `redirectsOrigin`, `baseRelDir`, `functions`, `functionsDirectory`. Everything
else is omitted (`build.services`, `build.functions`, `images`, `dev`, `edge_functions`, `integrations`, `context`,
`functionsDirectoryOrigin`, `pinned_version`, unknown keys).

### 17.2 Transformations

- `build.environment` becomes the list of its keys in insertion order, minus `BRANCH`, `CONTEXT`, `DEPLOY_PRIME_URL`,
  `DEPLOY_URL`, `GO_VERSION`, `NETLIFY_IMAGES_CDN_DOMAIN`, `SITE_ID`, `SITE_NAME`, `URL`.
- Each plugin becomes `{ package, origin, inputs }` with only boolean-valued inputs (`{}` when none; the `origin` key is
  present even when `undefined`).
- The object is simplified (§16.4); `headers` and `redirects` are then truncated to their first 100 items.
- Resulting key order: `headersOrigin`, `redirectsOrigin`, `baseRelDir`, `functionsDirectory`, `functions`, `build`
  (`base`, `command`, `commandOrigin`, `edge_functions`, `ignore`, `publish`, `publishOrigin`, `environment`,
  `processing`), `plugins`, `headers`, `redirects`, each only if kept.
- `cleanupConfig({})` is `{}`. A `null` `build`, `build.environment`, plugin or plugin `inputs` throws the bug
  `TypeError` `<name> must be an object` (`<name>` is `build`, `environment`, `plugin` or `inputs`); a `plugins` that is
  not an array, `null` included, throws `plugins must be an array`. Other non-object values are spread: a string
  `build.environment` prints its indexes, a number prints nothing.

## 18. Logging

### 18.1 Sinks

- A `logs` object that has a `stdout` key (own or inherited) is buffered: messages are pushed to `logs.stderr`; nothing
  is pushed to `stdout`. Otherwise messages go to `console.warn` (stderr). stdout is reserved for the binary's JSON.
- Before every message, `logs.outputFlusher.flush()` is called when present.
- `resolveConfig` uses its own buffer when `buffer` is truthy, else streams. `updateConfig` uses the `logs` it is given.

### 18.2 Formatting

- Every line that is empty or whitespace-only is replaced by U+200B (zero-width space), before colouring, using a
  multi-line `^\s*$` match. Consecutive blank lines collapse (`"a\n\n\nb"` → `"a\n\u200B\u200B\nb"`) **(quirk)**.
- Colours are auto-detected (forced with `FORCE_COLOR`): warnings bright yellow; sub-headers cyan bold; validation
  highlights per §10.2.
- A sub-header is `"\n" + pointer + " " + title`, where pointer is `❯` (or `>` without Unicode).
- An object is printed as YAML with sorted map keys, sequences in order, `undefined` values omitted, trailing whitespace
  trimmed, uncoloured.

### 18.3 Debug output

When `debug` is on (§2.4), in order:

1. `Initial build environment`, only when neither `cachedConfig` nor `cachedConfigPath` is present: the given
   (pre-default) values of `config`, `cwd`, `context`, `branch`, `mode`, `repositoryRoot`, `siteId`, `baseRelDir` when
   present (`baseRelDir: false` prints); `env` as the list of the `env` option's keys, when non-empty; and
   `featureFlags: []` always. Nothing else (no token, host, configs). Printed before directory validation.
2. `UI build settings`, always: `cleanupConfig({ ...defaultLayer, baseRelDir })`.
3. `Configuration override`, when the mutated inline config has a key: `cleanupConfig(inlineLayer)`.
4. `Resolved build environment`: `{ configPath, buildDir, context, branch, env }`, with `env` the result's names in
   order minus the §17.2 list; `configPath` omitted when undefined.
5. `Resolved config`: `cleanupConfig(result.config)`.

Blocks 2–5 are not printed on a cached short-circuit. Token and env values are never printed.

### 18.4 Warnings

Lenient checks log `Unexpected <description>, used as is:\n<issues>`, where `<issues>` is one block per issue:
`✖ <message>\n  → at <path>` (e.g. `✖ Invalid input: expected record, received string\n  → at build.environment`). The
checked value is used unchanged.

| Warning                                                                                            | §    |
| -------------------------------------------------------------------------------------------------- | ---- |
| `Unexpected defaultConfig option, which should be an object, spread into one` (and `inlineConfig`) | 2.6  |
| `Unexpected configMutations option, used as is:\n…`                                                | 2.6  |
| `Unexpected cached config, used as is:\n…`                                                         | 5.6  |
| `Unexpected site information from the Netlify API, used as is:\n…`                                 | 4.3  |
| `Unexpected accounts from the Netlify API, used as is:\n…`                                         | 4.4  |
| `Unexpected configuration, used as is:\n…`                                                         | 10.4 |
| `Unexpected auto-installable extensions from the extension API, used as is:\n…`                    | 14.4 |
| `Failed to auto install extension(s): …`, `Failed to fetch auto-installable extensions meta: …`    | 14.4 |
| UI plugin in a context                                                                             | 7.4  |
| `\nWarning: some headers/redirects have syntax errors:…`                                           | 12.3 |
| `\nWarning: the same header is set twice with different cases…`                                    | 12.3 |

### 18.5 Output bypassing the logger

None. Every message, including auto-install messages (§14.4) and `Checking site information` (§5.6), goes through the
logger, so only the binary writes to stdout (§19).

## 19. The `netlify-config` binary

### 19.1 Invocation

`netlify-config [OPTIONS...]` parses its flags (non-strict), calls `resolveConfig(flags)` and prints the result. Usage
text:

```
netlify-config [OPTIONS...]

Retrieve and resolve the Netlify configuration.
The result is printed as a JSON object on stdout.
```

### 19.2 Flags

- Visible: `--config`, `--cwd`, `--packagePath`, `--repositoryRoot`, `--output`, `--stable` (boolean, default false),
  `--token`, `--siteId`, `--accountId`, `--context`, `--branch`, `--offline` (boolean).
- Hidden: `--defaultConfig`, `--cachedConfig`, `--inlineConfig` (JSON strings), `--configMutations` (one JSON array
  string), `--cachedConfigPath`, `--host`, `--scheme`, `--pathPrefix`, `--mode` (strings), `--baseRelDir`, `--debug`,
  `--buffer` (booleans), `--testOpts`, `--featureFlags`.
- Unknown camelCase flags are forwarded as options (`--deployId=x`). Dash-cased aliases (`--site-id`) work; dash-cased
  copies, one-letter keys, `_`, `$0`, `help`, `version`, `stable`, `output` are not forwarded.
- `--no-<flag>` negates booleans. Dot notation builds objects: `--testOpts.env=true` gives `{ env: 'true' }` (a string),
  while numeric strings become numbers. A string flag without a value gives `''`, i.e. absent (`--config=` is ignored).
  Surrounding double quotes are stripped from values, so a JSON string literal cannot be passed.
- `--featureFlags=a,b` gives `{ a: true, b: true }`: blank names skipped, others not trimmed (`a, b` gives `' b'`). No
  way to pass `false`. A non-string value gives `{}`. Without the flag, `{}`.
- Invalid JSON or other flag validation failures print the usage and options, a blank line and the error to stderr, and
  exit 1 before resolution. `--help` prints to stdout and exits 0. `--version` prints the version of the host project's
  `package.json`, not this package's **(quirk)**.

### 19.3 Output

- The result with `api` removed and `hasApi: true` appended last when a client existed, and `token` removed.
- Without `--stable`: `JSON.stringify(result, null, 2)` in insertion order (§1.3). With `--stable`: keys sorted
  recursively, 2-space indentation. `undefined` values vanish; `logs` appears only with `--buffer`.
- `--output` unset or `-`: written to stdout with a trailing newline. Otherwise a file path resolved against the process
  cwd (not `--cwd`); parent directories created; no trailing newline; nothing on stdout. `--output=` fails as a bug
  (exit 2) **(quirk)**.
- A cached short-circuit prints the cached object back, with the same `token`/`hasApi` handling. The output is accepted
  back by `--cachedConfig`/`--cachedConfigPath`.

### 19.4 Exit codes

| Outcome              | stderr                             | Exit code |
| -------------------- | ---------------------------------- | --------- |
| Success              | logs only                          | 0         |
| User error           | `error.message` only               | 1         |
| Flag parsing failure | usage + message                    | 1         |
| Any other error      | `error.stack`, or the thrown value | 2         |

Exit codes are set without forcing an exit, so large output is flushed. Buffered logs are lost on error.

## 20. What consumers rely on

Changing any of these breaks @netlify/build, netlify-cli or the buildbot.

1. **User-error marker.** `customErrorInfo.type === 'resolveConfig'` on every user error, as a mutable own object
   property, including API fetch failures (netlify-cli retries offline on them; build shows them as "Configuration
   error"; telemetry skips them).
2. **Prefixes.** `When resolving config file <path>:\n`, `When resolving config:\n`,
   `When applying configuration from <origin>:\n`; mutation errors unprefixed.
3. **Result keys.** `config`; `configPath` (`undefined` when there is no file); `buildDir`; `repositoryRoot`;
   `headersPath`/`redirectsPath` (always strings); `context`; `branch`; `token`; `api` (an API client whose methods are
   own enumerable properties, or `undefined`); `siteInfo` (raw API passthrough with `id` forced, or
   `{ id?, account_id? }`); `env` (exact source strings, highest first, `value` a string); `integrations`
   (`buildPlugin.packageURL` a `URL`, `buildPlugin` non-null whenever `has_build`); `accounts` (passthrough).
4. **Config invariants.** `build.publish` and `build.publishOrigin` always set, `'default'` meaning defaulted;
   `build.commandOrigin` set whenever `build.command` is; `build.environment` an object; `functions['*']` present;
   `headers`/`redirects` parsed arrays; `plugins[].origin` and `plugins[].inputs`; paths absolute; `build.functions`
   mirroring `functionsDirectory`.
5. **Cached config.** Returned as is only when `defaultConfig === undefined`; `internal` env entries reused; site data
   reused under `use_cached_site_info`.
6. **`EVENTS` and `DEV_EVENTS`**: contents and order.
7. **`mergeConfigs`** with `concatenateArrays`: later wins for objects and scalars, arrays concatenated later-first,
   `build` always present.
8. **`applyMutations`**: pure; the read-only and after-event texts; dev events never reject build props.
9. **`cleanupConfig`**: the key set of §17.
10. **`updateConfig`/`restoreConfig`**: no-op without mutations; mutations win over context properties;
    `_headers`/`_redirects` merged into `netlify.toml` and deleted; backups in `<buildDir>/.netlify/deploy`; restore
    copies backups back and deletes files without one.
11. **Binary**: its flags, JSON output without `token` and with `hasApi`, exit codes 0/1/2, logs only on stderr.
