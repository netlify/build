# Type-safety remediation plan for `netlify/build`

Status: proposal. Every number here was measured on `224d0ab` with TypeScript 5.9.3, with all
workspace packages built (`npx lerna run build`), so each package's baseline is 0 errors. §10
explains how to reproduce the numbers.

---

## 1. Summary

- **`noImplicitAny` is most of the compiler-level debt, and it sits in a handful of
  functions.** In `packages/build`, enabling every disabled strict flag gives 861 errors, and
  `noImplicitAny` alone accounts for 747 (87%). Those 747 fall in 148 functions, and **7
  functions hold 321 of them**: `runStep`, `tFireStep`, `initAndRunBuild`, `tExecBuild`,
  `runAndReportBuild`, `runBuild`, `fireCoreStep`. 81% are TS7031, which is a destructured
  parameter with no annotation. So the error count mostly measures how many fields those
  functions destructure, not how much design work is left.
- **Types come back as `any` at the pipeline's boundaries.** `measureDuration`
  (`build/src/time/main.ts:46`) wraps six pipeline entry points and returns
  `Promise<any>`. Whatever those six functions return reaches its callers unchecked. This
  includes the resolved config, which enters `@netlify/build` through `tLoadConfig`. Until
  `measureDuration` gets a real signature, even a correct `@netlify/config` type does
  nothing inside `@netlify/build`.
- **The highest-value change is also a breaking one.** `@netlify/config`'s main export,
  `Config`, has 13 of 15 fields hand-written as `any` (`config/src/main.ts:29-45`), and
  `resolveConfig`'s argument is untyped. `netlify-cli` assigns that result to its own
  hand-written `CachedConfig` type, which only compiles because the value is `any`. Typing
  `Config` properly will break the CLI's type check. It has to ship as a coordinated
  release, not an internal refactor.
- **One bug confirmed in the published packages.** `@netlify/build`'s declarations import
  `'packages/js-client/lib/types.js'`, a specifier that only resolves inside this monorepo.
- **Import cycles do not block incremental conversion.** At runtime, `packages/build` has one
  cycle, between two files (`steps/error` ↔ `steps/plugin`). Larger cycles appear only when
  type-only imports are counted, and TypeScript doesn't need an acyclic graph to type-check
  or to convert files. `packages/config` has no runtime cycle.
- **Do not ratchet on raw totals.** Making types accurate often *raises* a package's error
  count. The guardrail proposed here (§5) is a baseline per file and error code, where a PR
  that adds errors updates the baseline and reviewers see the diff.

---

## 2. Measured state

### Compiler flags

`tsconfig.base.json` sets `strict: true` and then turns ten checks back off, in a block
commented *"REMOVE THOSE ALL ONCE WE HAVE HANDCRAFTED TYPES"*. `checkJs` is off, so the 117
`.js` source files are not type-checked. Because `allowJs` and `declaration` are on,
TypeScript still generates `.d.ts` files for those `.js` files from inferred types.

Extra errors from turning on each flag, measured two ways: against the `.ts` files alone, and
with `checkJs` also on, in which case the number is the extra above what `checkJs` alone adds
(57 in `build`, 46 in `config`):

| Flag | `build` | `build` + checkJs | `config` | `config` + checkJs |
|---|--:|--:|--:|--:|
| `checkJs` | — | 57 | — | 46 |
| `noImplicitAny` | **747** | **1,720** | **117** | **545** |
| `noPropertyAccessFromIndexSignature` | 32 | 32 | 4 | 6 |
| `strictFunctionTypes` | 25 | 27 | 1 | 1 |
| `exactOptionalPropertyTypes` | 22 | 22 | 10 | 10 |
| `noUncheckedIndexedAccess` | 16 | 19 | 2 | 2 |
| `useUnknownInCatchVariables` | 12 | 34 | 8 | 9 |
| `noImplicitReturns` | 4 | 4 | 1 | 3 |
| `strictBindCallApply` | 3 | 3 | 0 | 0 |
| `noImplicitOverride` | 1 | 1 | 0 | 0 |
| `strictPropertyInitialization` | 0 | 0 | 0 | 0 |
| **All of the above (total)** | **861** | **1,918** | **143** | **622** |

**These costs are lower bounds.** They were measured while the main code path is `any`,
so the checks have little to act on. Turning on `checkJs` already nearly triples
`useUnknownInCatchVariables` in `build` (12 → 34). Expect every flag's cost to grow as real
types replace `any`. None of these flags is free. They are cheap *now* because enabling
them early means new code is written against them.

The same measurement for the other packages, with every flag and `checkJs` on:

| Package | Errors | Package | Errors |
|---|--:|---|--:|
| `build-info` | 732 | `testing` | 33 |
| `zip-it-and-ship-it` | 127 | `nock-udp` | 17 |
| `edge-bundler` | 111 | `opentelemetry-sdk-setup` | 6 |
| `js-client` | 105 | `opentelemetry-utils` | 3 |
| `redirect-parser` | 74 | `functions-utils` | 3 |
| `cache-utils` | 49 | `run-utils` | 2 |
| `git-utils` | 41 | `headers-parser` | 1 |

Package tsconfigs also override the base config in different directions.
`zip-it-and-ship-it` and `headers-parser` turn several checks back on,
including `noImplicitAny`. `headers-parser` also keeps `strictFunctionTypes` off, and that
flag is the source of its one remaining error. `build`, `nock-udp` and `testing` turn off
`strictBindCallApply`. `edge-bundler` has its own tsconfig that doesn't extend the base
(`strict: true`, `moduleResolution: "node"`, `target: "ES2023"`).

### JavaScript sources

| Package | `.js` files | LOC | Errors in them (`checkJs` + `noImplicitAny`) |
|---|--:|--:|--:|
| `build` | 68 | 5,100 | 1,030 |
| `config` | 34 | 2,102 | 474 |
| `js-client` (published as `@netlify/api`) | 8 | 346 | — |
| `redirect-parser` | 7 | 438 | — |
| **Total** | **117** | **7,986** | |

### Explicit escape hatches

- `config`: a global `$TSFixMe = any` (`config/tsfixme.d.ts`), used 22 times. There are
  also plain `any`s it doesn't cover: the 13 in `Config` (`src/main.ts:29-45`), and
  `siteInfo: any; accounts: any` in `src/env/main.ts`'s `getAccountEnv`.
  `src/redirects.ts` uses `$TSFixMe` 4 times.
- `build`: `as any` at `core/build.ts:158`, `steps/run_core_steps.ts:79,105,145,191` and
  `core/main.ts:134`, plus `: any` annotations at `steps/run_core_steps.ts:18` and
  `core/main.ts:52,135,199`. `plugins_core/types.ts:46` types `explicitSecretKeys` as
  `$TSFixme`.

### ESLint

The root config uses `typescript-eslint`'s `strictTypeChecked` and turns rules off per file
in `eslint_temporary_suppressions.js`: 2,874 lines, 1,046 file×rule entries across 359 files.
482 of those entries are `no-unsafe-*` rules. Per package: `build` 352, `zip-it-and-ship-it`
154, `build-info` 127, `config` 119, `edge-bundler` 91.

These rules overlap with the compiler work but won't fully clear up as a side effect of it.
`headers-parser` has every strict compiler check on except `strictFunctionTypes`, and it still
has 13 suppressions, 6 of them `no-unsafe-*`. That's because `no-unsafe-*` also reports `any`
coming from dependencies.

`import/no-cycle` is configured (`eslint.config.js:59`) but doesn't report the one real
runtime cycle. No import resolver is configured, and the default one can't map
`./error.js` in a `.js` file to `error.ts`.

---

## 3. What reaches consumers

### Types that reach consumers

`@netlify/build` and `@netlify/config` each export a single entry point (`./lib/index.js`).
Starting from `lib/index.d.ts` and following imports, consumers can reach 32 of `build`'s 183
`.d.ts` files (51 `any`s out of 953 in the package) and 10 of `config`'s 61 (43 `any`s out
of 338). The rest of the `any`s affect only this repo's own code.

The reachable `any`s are on the most important types:

- `@netlify/config`: `resolveConfig: (opts: any) => Promise<Config>`, and `Config.config` (the
  resolved `netlify.toml`) is `any`, along with `api`, `branch`, `buildDir`, `configPath`,
  `context`, `env`, `headersPath`, `logs`, `redirectsPath`, `repositoryRoot`, `siteInfo` and
  `token`. These `any`s are written by hand in `src/main.ts:29-45`, not inferred.
  `src/index.ts` exports 8 values and no types, so consumers cannot import `Config` by name.
- `@netlify/build`: `buildSite(flags?: Partial<BuildFlags>)` is well typed.
  `startDev(devCommand: any, flags?: {})` is not, and returns `netlifyConfig: any`,
  `configMutations: any` and `deployEnvVars: any`. The CLI calls it at
  `cli/src/utils/run-build.ts:193`.

### How netlify-cli relies on this

`cli/src/commands/base-command.ts` returns `resolveConfig(...)` as `Promise<CachedConfig>`,
and a `FIXME` there says typing it in `netlify/build` is blocking better types across the
CLI. `CachedConfig` (`cli/src/lib/build.ts:16`) is written by hand and has required nested
fields. It compiles only because `resolveConfig` returns `any`. The CLI depends on
`@netlify/build@^37.0.0` and `@netlify/config@^25.2.5`, and releases here go out through
release-please with squash merges. **An accurate `Config` published in a minor or patch
release would break the CLI's type check the next time it updates.**

### Bug in the published packages

`build/src/status/validations.ts:1` and `build/src/plugins_core/types.ts:1` import
`'packages/js-client/lib/types.js'`, which resolves only through `baseUrl: "./"` at the repo
root. The import is copied as-is into the published declarations:

```ts
// @netlify/build@37.0.0 — lib/plugins_core/types.d.ts
import { type DynamicMethods } from 'packages/js-client/lib/types.js';
```

For a consumer, that specifier points at a package literally named `packages`. Without
`skipLibCheck`, the consumer's type check fails on it. With `skipLibCheck`, the type
silently becomes `any`. The fix: type
the value as `NetlifyAPI` from `@netlify/api`, which extends `DynamicMethods`, as
`config/src/api/site_info.ts` already does. Also add `@netlify/api` to `@netlify/build`'s
dependencies, since today it's only a transitive dependency via `@netlify/config`.

---

## 4. Where the debt actually is

### `packages/build`: the pipeline

The functions with the most implicit-`any` parameters, all of which destructure one large
context object:

| Function | Errors | Wrapped by `measureDuration` |
|---|--:|:-:|
| `steps/run_step.ts:19` `runStep` | 58 | |
| `steps/run_step.ts:321` `tFireStep` | 48 | yes |
| `core/build.ts:405` `initAndRunBuild` | 46 | |
| `core/build.ts:44` `tExecBuild` | 45 | yes |
| `core/build.ts:237` `runAndReportBuild` | 45 | |
| `core/build.ts:596` `runBuild` | 41 | |
| `steps/core_step.ts:8` `fireCoreStep` | 38 | |
| `steps/run_core_steps.ts:50` `executeBuildStep` | 20 | |
| `plugins/options.ts:16` `tGetPluginsOptions` | 19 | yes |
| `steps/run_core_steps.ts:151` `runBuildStep` | 16 | |
| `plugins_core/functions/index.ts:62` `zipFunctionsAndLogResults` | 15 | |
| `steps/run_step.ts:266` `shouldRunStep` | 15 | |

The context object's first layer is already typed: `startBuild(flags: Partial<BuildFlags>)`
returns flags normalized to `ResolvedFlags` (`core/normalize_flags.ts:19`). The object then
gains fields as it flows down the pipeline, and some fields are renamed at function
boundaries (`env` → `envOpt`, `repositoryRoot` → `repositoryRootA`, `quiet` →
`coreStepQuiet`). One interface won't cover it. It needs a chain of types, each extending
the previous one:

| Type | Proposed home | Built from |
|---|---|---|
| `BuildSession` | `src/core/context.ts` (new) | extends `ResolvedFlags`, plus `errorMonitor`, `logs`, `timers` and the flags `ResolvedFlags` is missing (`nodePath`, `deployId`, `buildId`, `featureFlags`, `packagePath`, `quiet`, `eventHandlers`, …) |
| `ResolvedConfigContext` | `src/core/context.ts` | `@netlify/config`'s `Config`, plus fields `core/config.js` adds (`packageJson`, `userNodeVersion`, `childEnv`, `configOpts`) |
| `BuildPipelineContext` | `src/core/context.ts` | `BuildSession & ResolvedConfigContext & { constants, pluginsOptions, systemLog, childProcesses }` |
| `StepContext` | `src/steps/types.ts` (new) | `BuildPipelineContext` plus one step descriptor (extending `CoreStep`, `plugins_core/types.ts:62`) plus the state threaded through `steps/run_steps.js` |

These types stay internal, so they belong in `src/core/` and `src/steps/`. Everything in
`src/types/` is re-exported from `src/index.ts` as the public plugin-author API, and that
public surface is covered by the `tsd` tests in `test-d/`.

Some shapes need a union rather than an interface:

- `tFireStep`'s result is one of two shapes, the core-step result or the plugin-step result,
  each with an error variant. Declare it as a discriminated union.
- `eventHandlers` is typed `any[]` in `steps/get.ts:20,30,53`, but the code treats it as an
  object (`Object.entries`). `core/types.ts` already defines the correct mapped type.
- `errorParams` gains fields after it's created (`Object.assign` at `core/build.ts:162` and
  `steps/run_core_steps.ts:107`). Type the fields added later as optional. Don't change it
  to a class as part of a typing PR.
- `explicitSecretKeys` is a `string[]` on some paths and a comma-joined `string` on others.
  Type it as the union it actually is. Merging the two representations is a behaviour
  change to secrets scanning and needs its own PR.

### `measureDuration`

```ts
// build/src/time/main.ts
const kMeasureDuration = function (func, stageTag, options = {}) {
  return async function measuredFunc({ timers, ...opts }, ...args) {
    // ...calls func, appends a Timer, returns { ...result, timers, durationNs }
  }
}
export const measureDuration = keepFuncProps(kMeasureDuration)
```

It wraps `tExecBuild`, `tFireStep` (twice), `tGetPluginsOptions`, `tStartPlugins`,
`tLoadConfig` and `tLoadAllPlugins` (the last two are in `.js` files). Its emitted type is
`({ timers, ...opts }: { [x: string]: any; timers: any }, ...args: any[]) => Promise<any>`.

The wrapper changes the function's shape: it requires `timers` on the argument and adds
`timers` and `durationNs` to the result. So the signature has to say that. A generic that
just returns `T` would be wrong, and adds 17 errors. This version was tested on the current
code:

```ts
export type Timer = ReturnType<typeof createTimer>

type Measured<Result> = Result extends unknown
  ? Omit<Result, 'timers' | 'durationNs'> & { timers: Timer[]; durationNs: number }
  : never

export const measureDuration: <Args extends object, Rest extends unknown[], Result extends object>(
  fn: (args: Args & { timers: Timer[] }, ...rest: Rest) => Promise<Result>,
  stageTag: string,
  options?: MeasureDurationOptions,
) => (args: Args & { timers: Timer[] }, ...rest: Rest) => Promise<Measured<Result>> =
  keepFuncProps(kMeasureDuration)
```

It adds 7 errors in 3 files (`core/build.ts`, `steps/run_core_steps.ts`,
`steps/run_step.ts`). All of them come from the wrapped functions' own untyped or two-shape
results: the plugin-options array doesn't match `PluginsOptions`, `tFireStep` returns two
different shapes, and `loadConfig`'s parameter type is inferred from a `.js` file. Fix them
in the same PR.

In the same PR, also fix `MeasureDurationOptions.tags`. It's declared `string[]`
(`time/main.ts:17`), but the code passes an object (`time/main.ts:31`), and
`time/report.ts:20` treats it as `Record<string, string | string[]>`. `Timer`'s `tags` must
use the latter.

### `packages/config`

`noImplicitAny` gives 117 errors in 50 functions, mostly in `src/main.ts` (37) and
`src/env/main.ts` (33).

A variable named `config` holds a different shape at each stage of the pipeline, so the
config type has to come in three stages:

```ts
PartialNetlifyConfig    // as parsed from netlify.toml, UI settings or inline config; everything optional
NormalizedNetlifyConfig // after normalizeConfig(): defaults filled in, functions['*'] present
ResolvedNetlifyConfig   // after resolveFiles/addHeaders/addRedirects: absolute paths, parsed headers/redirects
```

The supporting types are implicit today and already written down in code as constants or
tables: `ConfigOrigin` (`src/origin.js`), `FunctionConfig` (`src/functions_config.js`),
`EdgeFunctionDeclaration` (`src/edge_functions.ts`), `ConfigValidation`
(`src/validate/validations.js`), plus `PluginConfig`, `ConfigMutation` and `Logs`.

The options passed to `resolveConfig` change in two steps. `addDefaultOpts` fills in
defaults (`src/options/main.js:17`), then `normalizeOpts` adds `repositoryRoot`, `branch`,
an absolute `cwd` and, optionally, `base`/`baseRelDir`. So that needs two types:
`ResolveConfigOptions` for the input, and a normalized variant with those fields required.
`src/bin/flags.ts` lists most of the fields, but not `siteFeatureFlagPrefix`, `env` or
`logs`, and it accepts JSON strings where programmatic callers pass objects. Use it as a
starting point, not as the spec.

### Type mismatches already visible

The compiler already reports these, or they're visible by reading the code:

- `MinimalAccount` (`config/src/api/site_info.ts:137`) doesn't declare `site_env`, yet
  `config/src/env/main.ts:196` destructures `site_env` from an account. This only compiles
  because `accounts` is `any` at that point.
- `build/src/steps/error.ts:66` reads `build.cancellation.packageName`, and
  `build/src/steps/run_step.ts:90-91` read `build.execution.step.plugin_name` and
  `plugin_version`. None of the three is declared in the relevant attribute types (TS2551,
  visible under `noImplicitAny`).
- `ResolvedFlags.dry` is declared as the literal `false`, and `statsdOpts.host` as `number`
  (it holds a hostname) (`core/normalize_flags.ts:42,44`). Nothing reads either one through
  a typed path, so correcting them changes no errors today. Correct them when building
  `BuildSession`.

---

## 5. Guardrails

Put these in place before the typing work, so progress is measurable and doesn't slip back.

**G1. A type-debt baseline per file and error code, checked in CI.**
`scripts/type-debt/diagnostics.ts` type-checks a package with extra flags and compares the
result to a committed JSON baseline of error counts per file and error code. CI runs it for
each package with the end-state flag set (every disabled flag plus `checkJs`) after the
existing build step. It fails when any file/code count goes up. A PR that correctly adds
errors, for example by replacing an `any` with a real type, runs `--update`, and reviewers
see the baseline diff. This enables every target flag for new code immediately, without
touching the tsconfigs that `npm run build` uses and without one PR per flag.

**G2. Replace `eslint_temporary_suppressions.js` with ESLint's bulk suppressions.** The
installed ESLint (9.39) supports `--suppress-all` and `--prune-suppressions`, which keep an
`eslint-suppressions.json` file up to date automatically. Hand-editing the 2,874-line file in
every conversion PR would make it a merge-conflict hotspot. Keep the file's global section
(the rule settings at the top that apply everywhere). Move only the per-file blocks.

**G3. Compile netlify-cli against these packages in CI.** Pack `@netlify/build` and
`@netlify/config`, install the tarballs into a checkout of netlify-cli's default branch, and
run the CLI's type check. Required before any change to a public type. Also add `tsd` tests
for `@netlify/config`'s exports (`Config`, `resolveConfig`), since only `@netlify/build` has
them today (`test-d/`).

**G4. Block new `.js` and new runtime cycles.** `typescript-nudge.yml` only posts a comment
today. Make it fail on *newly added* `.js` files under `packages/*/src/` (keep the comment
for modified ones). Since `import/no-cycle` misses cycles that go through `.js` → `.ts`
imports, check cycles in the emitted code instead: `scripts/type-debt/analyze.ts` reports
cycles in the emitted `lib/` output, so fail CI when a new one appears.

**G5. Run the test tsconfig in CI.** `tsconfig.test.json` isn't type-checked in any
workflow, and `config`'s tests are `.js`. So today nothing checks new internal types against
how the tests call the code. Add the test type check to CI, next to G1.

Not a guardrail, and leave it alone for now: `packages/build/tsconfig.json` and
`packages/build-info/tsconfig.json` have no `include`. That picks up malformed test fixtures
if someone runs `tsc -p tsconfig.json` by hand. But ESLint uses these files
(`eslint.config.js:35`) to get type information for test files, so restricting them to
`src` would take the tests out of typed linting. If cleaning up, make them solution-style
(`"files": []` plus `references`) and add `tsconfig.test.json` to ESLint's project list.

---

## 6. Sequencing

The first PRs, in order:

| # | PR | Files | Depends on |
|---|---|---|---|
| 1 | Fix the monorepo-only import path; add the `@netlify/api` dependency | `build/src/status/validations.ts`, `build/src/plugins_core/types.ts`, `build/package.json` | — |
| 2 | Guardrails G1–G5 | CI workflows, `scripts/type-debt/`, `eslint.config.js`, suppressions file | — |
| 3 | `measureDuration` signature, `Timer` type, `tags` fix, `tFireStep` result union | `build/src/time/{main,report,aggregate}.ts`, `build/src/steps/run_step.ts`, `build/src/core/build.ts`, `build/src/steps/run_core_steps.ts` | 2 (G1) |
| 4 | Enable `checkJs` in `config` (46 errors) and `build` (57) | see below | 2 |
| 5 | `@netlify/config` public types, coordinated with netlify-cli | see below | 2 (G3) |

PRs 1, 2 and 4 can run in parallel with each other. PR 3 and PR 5 touch different packages
and can also run in parallel.

### PR 4: `checkJs`

Fix the errors, then set `checkJs: true` in the package tsconfig, so the build itself starts
checking the `.js` files. Where the errors are:

- `config` (46): `options/main.js` 12, `log/cleanup.js` 8, `simplify.js` 6, `origin.js` 5,
  `validate/main.js` 4, `bin/main.js` 3, `api/client.js` 2, and one each in
  `validate/helpers.js`, `mutations/update.js`, `mutations/apply.js`, `merge.js`,
  `log/logger.js`, `cached_config.js`.
- `build` (57): `steps/run_steps.js` 16, `plugins/ipc.js` 6, `error/api.js` 5,
  `log/messages/core_steps.js` 4, `log/messages/config.js` 4, `error/monitor/print.js` 3,
  then 1–2 each in 15 other files. Most are TS2339 (property does not exist).

Split by file if several people take it. None of these files is touched by PR 3 or PR 5.

### PR 5: `@netlify/config` public types

1. Add the staged config types (§4) and the supporting types in `config/src/types/`.
2. Type `resolveConfig`'s argument (`src/main.ts:52`) and replace the `any`s in `Config`
   (`src/main.ts:29-45`). Use the CLI's `CachedConfig` (`cli/src/lib/build.ts:16`) as the
   spec for the output. Every difference between the two is either a CLI bug or a
   guarantee `@netlify/config` doesn't actually make, and each one should be decided on
   purpose.
3. Export the types from `src/index.ts`, along with `SiteInfo`, `MinimalAccount`,
   `Extension`, `ModeOption` and `TestOptions`.
4. Leave `EVENTS`/`DEV_EVENTS` as `string[]`. Making them `as const` breaks
   `EVENTS.includes(propName)` in `build/src/plugins/child/validate.js:25`. If a literal
   type is wanted, add a type guard.
5. Add `site_env` to `MinimalAccount`, or change `env/main.ts:196` to stop reading it.
6. Release as semver-major for `@netlify/config`, or land a CLI PR first that accepts both
   the old and new types. G3 shows which.

This PR mostly benefits netlify-cli. Inside `@netlify/build`, the config comes in through
`tLoadConfig` (`build/src/core/config.js`), so `@netlify/build` gets the benefit only after
PR 3 and the conversion of `core/config.js`.

### After the first PRs: `@netlify/build` annotation, split by who owns which files

Assign each work package to one owner, split by file, so they don't conflict:

| Work package | Owns these files | Depends on |
|---|---|---|
| **A. Pipeline context** | `core/{build,main,normalize_flags,types}.ts`, new `core/context.ts`, `steps/run_core_steps.ts` | PR 3, PR 5 |
| **B. Step execution** | `steps/{run_step,core_step,error,get}.ts`, new `steps/types.ts` | A's `core/context.ts` merged |
| **C. Plugins** | new `plugins/types.ts`, `plugins/{options,spawn,expected_version,node_version}.ts`, `log/messages/compatibility.ts`, `telemetry/main.ts`, `error/parse/plugin.ts`, `plugins/child/load.ts` | PR 3 |
| **D. Standalone functions** | `error/parse/{parse,serialize_log,serialize_status,location}.ts`, `error/types.ts`, `core/constants.ts`, `plugins_core/{functions,edge_functions,deploy}/*.ts` | PR 3 |

- **A** builds the context chain from §4. It removes the `as any` casts and `: any`
  annotations listed in §2 in the same PRs, and fixes `ResolvedFlags.dry` and
  `statsdOpts.host`.
- **B** adds the `StepContext` type and the `tFireStep` result union, fixes the
  `eventHandlers` annotations in `steps/get.ts`, and fixes the three undeclared attribute
  names (TS2551).
- **C** defines a `PluginOptions` type in which `loadedFrom` and `origin` are unions of
  string literals. Expect this to reveal cases that `getPluginOrigin`/`getInstallType`
  don't handle. C annotates `tGetPluginsOptions`'s context argument only once A's types
  exist.
- **D** annotates against types that already exist: `BuildError` and `ErrorInfo` in
  `error/types.ts`, and `CoreStepCondition` and `CoreStepFunctionArgs` in
  `plugins_core/types.ts:10,58`. It adds a `GetConstantsOptions` type in
  `core/constants.ts`. `functionsDirectory` goes on an internal type there, not on the
  public `NetlifyConfig`, which the `test-d/` type tests cover.

C and D can start as soon as PR 3 lands, and run in parallel with each other and with A.

### `.js` → `.ts` conversion

Convert in the wave order given in the appendix. A file's wave comes after the waves of all
the `.js` files it imports, so types flow in from already-converted code. Files within a
wave are independent of each other.

Rules for every conversion:

- **Two PRs: a pure rename, then the annotations.** The repo squash-merges, so a file that's
  renamed and heavily edited in one PR can drop below git's rename-detection threshold and
  lose its blame history.
- **Break the runtime cycle before converting `build/src/steps/plugin.js`.**
  `steps/plugin.js` imports `getPluginErrorType` from `steps/error.ts`, and `steps/error.ts`
  imports `isTrustedPlugin` from `steps/plugin.js`. Move `isTrustedPlugin` into a module
  with no imports back into `steps/`. Converting a file from `.js` to `.ts` makes TypeScript
  drop imports that are used only as types (it never drops them in `.js` files). That can
  change the order modules load in, and the only place that matters is around this cycle.
- **Don't change behaviour.** `config`'s validation messages are pinned by 66 snapshots
  (`config/tests/validate/__snapshots__/validate.test.js.snap`, 2,081 lines). Replacing
  `validate/*.js` with zod schemas would change those user-facing messages. That's a
  product decision, separate from typing.
- Each conversion PR runs `diagnostics.ts --update` to record the improvement and
  `eslint --prune-suppressions` to drop suppressions that no longer apply.

**`config`** (34 files, 5 waves, no runtime cycle). Convert these first, because they define
types the rest use: `options/main.js` (the two-step options shape), `log/logger.js` (`Logs`),
`origin.js` (`ConfigOrigin`), `functions_config.js` (`FunctionConfig`). Save the validator
pair for last: `validate/main.js` (43 errors), which recurses over `*` wildcards and passes
an object that it keeps modifying through `...rest` spreads, and `validate/validations.js`
(42). `merge.js`, `log/cleanup.js`, `mutations/apply.js` and `mutations/update.js` are
public API, so type them against PR 5's types.

**`build`** (68 files, 5 waves). The heaviest are `core/config.js` (66 errors, wave 2; it
produces `ResolvedConfigContext`, so convert it right after work package A),
`steps/run_steps.js` (52, the only caller of `runStep`), `status/report.js` (52),
`plugins/resolve.js` (48), `plugins/pinned_version.js` (44) and `plugins/load.js` (39).

**`js-client` and `redirect-parser`** (15 files, 784 LOC). Small, but `js-client` is published
as `@netlify/api`, so its types reach consumers. Both packages have to be converted before
`allowJs` can be turned off.

### Turning on flags in the real tsconfigs

For each package and each flag: when `diagnostics.ts <pkg> --<flag>` reports no errors,
enable the flag in that package's tsconfig. G1 already holds new code to the flag in the
meantime. When every package has the flag on, move it into `tsconfig.base.json` and delete
the per-package lines. Do this for one flag at a time. For each package, pick the order from
the costs in §2, measured again at the time, since they will have risen.

---

## 7. Where parallel work would collide

| Shared file | Touched by | How to resolve |
|---|---|---|
| `build/src/time/main.ts` | PR 3, work package C (`Timer` in telemetry/aggregation) | PR 3 lands first |
| `build/src/core/build.ts`, `steps/run_core_steps.ts` | PR 3, A | PR 3 lands first, A owns them afterwards |
| `build/src/steps/run_step.ts` | PR 3, B | PR 3 lands first, B owns it afterwards |
| `build/src/steps/error.ts` | B, the runtime-cycle fix | B owns it, and the cycle fix goes through B |
| `build/src/plugins/options.ts` | A (context argument), C | C owns it and annotates the argument once A's types exist |
| `eslint_temporary_suppressions.js` | every conversion PR | G2 removes the hotspot |
| `tsconfig.base.json` / package tsconfigs | flag PRs | G1 makes flag PRs rare and one at a time |
| Type-debt baseline JSON | every typing PR | one baseline file per package, updated by the tool |

---

## 8. End state

- `tsconfig.base.json` no longer has the block of disabled checks, so `strict: true`
  applies in full, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `noImplicitReturns`, `noImplicitOverride` and `noPropertyAccessFromIndexSignature`.
  `allowJs` is off once all 117 `.js` files are converted.
- Package tsconfigs contain only `extends`, output settings and `include`/`references`, with
  no strictness overrides. `edge-bundler`'s separate tsconfig, which uses
  `moduleResolution: "node"` and targets ES2023, moves onto the base. That changes its
  module resolution and emit target, so it's its own project with its own testing.
- `tsfixme.d.ts` is deleted, and the ESLint suppressions file is empty.
- The two `@ts-expect-error`s at `config/src/api/site_info.ts:126,153` stay. They cover
  parameters of the internal `@netlify/api` API that aren't in its types, so the fix belongs
  in `@netlify/api`.

---

## 9. Risks

- **Downstream breakage.** Covered by G3 and the release decision in PR 5. This applies to
  `startDev`'s types as well as `resolveConfig`'s.
- **Type checks passing while checking nothing.** An interface added next to a remaining
  `as any` cast, or behind an untyped `measureDuration`, makes `tsc` pass without checking
  anything. Review typing PRs for casts that are left in place.
- **Behaviour changes hidden in typing PRs.** Candidates: the two forms of
  `explicitSecretKeys`, turning `errorParams` into a class, zod-based validation, the order
  modules load in around the one runtime cycle. Keep each behaviour change in its own PR
  with its own tests.
- **Real bugs will turn up.** §4 lists the ones already visible. More should come from the
  literal-string unions in `PluginOptions` and from `useUnknownInCatchVariables`
  (`config/src/main.ts:349`, `config/src/api/site_info.ts:133,158`, where `error.message` is
  read from an `unknown`). Leave review time for them. Finding them is the point.
- **Error counts overstate progress.** Most of the implicit-any errors disappear once about a
  dozen function signatures are annotated. What takes the time is making the types
  *accurate*, and a count doesn't show that. Track the baseline, but judge progress by
  what the types now guarantee.

---

## 10. Reproducing the numbers

```bash
npm install && npx lerna run build

# import graph: cycles with all edges, without `import type` edges, and in emitted lib/; conversion waves
node scripts/type-debt/analyze.ts build config

# errors under extra flags, grouped by file, error code or enclosing function
node scripts/type-debt/diagnostics.ts build --noImplicitAny --by function
node scripts/type-debt/diagnostics.ts config --checkJs --noImplicitAny --by file

# baseline check (G1): writes the file on first run, then fails on any per-file/per-code increase
node scripts/type-debt/diagnostics.ts build --checkJs --noImplicitAny --baseline type-debt/build.json
```

Both scripts use the TypeScript compiler API and read each package's own tsconfig
(`tsconfig.build.json` if it exists, otherwise `tsconfig.json`).

---

## Appendix: `.js` inventory

`Errors` is the number of errors in that file with `checkJs` and `noImplicitAny` both on.
`Wave` is its conversion order: a file's wave comes after the waves of all the `.js` files it
imports.

### `packages/build` — 68 `.js` files

| File | LOC | Errors | Wave |
|---|--:|--:|--:|
| `src/log/messages/core_steps.js` | 261 | 41 | 1 |
| `src/plugins/manifest/check.js` | 107 | 38 | 1 |
| `src/plugins_core/functions/error.js` | 193 | 29 | 1 |
| `src/steps/return.js` | 69 | 28 | 1 |
| `src/log/messages/config.js` | 115 | 23 | 1 |
| `src/log/messages/mutations.js` | 93 | 22 | 1 |
| `src/install/main.js` | 91 | 20 | 1 |
| `src/log/messages/dry.js` | 64 | 17 | 1 |
| `src/log/messages/ipc.js` | 39 | 15 | 1 |
| `src/error/monitor/print.js` | 43 | 14 | 1 |
| `src/error/api.js` | 46 | 13 | 1 |
| `src/plugins/manifest/validate.js` | 108 | 13 | 1 |
| `src/log/messages/steps.js` | 19 | 12 | 1 |
| `src/env/changes.js` | 49 | 11 | 1 |
| `src/plugins_core/functions/utils.js` | 72 | 11 | 1 |
| `src/error/build.js` | 48 | 10 | 1 |
| `src/status/add.js` | 37 | 9 | 1 |
| `src/error/monitor/normalize.js` | 99 | 8 | 1 |
| `src/log/messages/status.js` | 17 | 8 | 1 |
| `src/status/success.js` | 19 | 8 | 1 |
| `src/core/lingering.js` | 95 | 7 | 1 |
| `src/core/missing_side_file.js` | 29 | 7 | 1 |
| `src/error/parse/clean_stack.js` | 85 | 7 | 1 |
| `src/utils/semver.js` | 39 | 7 | 1 |
| `src/utils/resolve.js` | 46 | 6 | 1 |
| `src/plugins/manifest/path.js` | 32 | 5 | 1 |
| `src/error/monitor/location.js` | 22 | 4 | 1 |
| `src/plugins/child/typescript.js` | 46 | 4 | 1 |
| `src/status/colors.js` | 24 | 4 | 1 |
| `src/status/load_error.js` | 12 | 4 | 1 |
| `src/error/parse/properties.js` | 24 | 3 | 1 |
| `src/plugins/child/validate.js` | 35 | 3 | 1 |
| `src/core/dev.js` | 46 | 2 | 1 |
| `src/error/cancel.js` | 9 | 2 | 1 |
| `src/error/colors.js` | 17 | 2 | 1 |
| `src/error/parse/normalize.js` | 30 | 2 | 1 |
| `src/core/flags.js` | 232 | 1 | 1 |
| `src/core/user_node_version.js` | 42 | 1 | 1 |
| `src/env/metadata.js` | 80 | 1 | 1 |
| `src/plugins_core/edge_functions/lib/error.js` | 22 | 1 | 1 |
| `src/utils/runtime.js` | 6 | 1 | 1 |
| `src/core/config.js` | 221 | 66 | 2 |
| `src/status/report.js` | 138 | 52 | 2 |
| `src/steps/run_steps.js` | 233 | 52 | 2 |
| `src/plugins/pinned_version.js` | 139 | 44 | 2 |
| `src/error/monitor/report.js` | 145 | 37 | 2 |
| `src/plugins/ipc.js` | 137 | 29 | 2 |
| `src/plugins/child/run.js` | 52 | 19 | 2 |
| `src/core/dry.js` | 62 | 16 | 2 |
| `src/error/parse/stack.js` | 44 | 12 | 2 |
| `src/log/messages/install.js` | 38 | 10 | 2 |
| `src/plugins/child/logic.js` | 66 | 10 | 2 |
| `src/plugins_core/build_command.js` | 86 | 9 | 2 |
| `src/core/bin.js` | 87 | 7 | 2 |
| `src/plugins/manifest/load.js` | 42 | 7 | 2 |
| `src/plugins/load.js` | 130 | 39 | 3 |
| `src/steps/update_config.js` | 117 | 26 | 3 |
| `src/install/missing.js` | 120 | 22 | 3 |
| `src/install/local.js` | 63 | 17 | 3 |
| `src/plugins_core/save_artifacts/index.js` | 55 | 16 | 3 |
| `src/install/functions.js` | 29 | 4 | 3 |
| `src/plugins/child/error.js` | 30 | 4 | 3 |
| `src/plugins/resolve.js` | 223 | 48 | 4 |
| `src/steps/plugin.js` | 124 | 28 | 4 |
| `src/plugins/child/main.js` | 66 | 10 | 4 |
| `src/plugins_core/list.js` | 28 | 3 | 4 |
| `src/plugins_core/functions_install/index.js` | 13 | 2 | 4 |
| `src/plugins_core/add.js` | 50 | 17 | 5 |

### `packages/config` — 34 `.js` files

| File | LOC | Errors | Wave |
|---|--:|--:|--:|
| `src/simplify.js` | 104 | 30 | 1 |
| `src/origin.js` | 39 | 20 | 1 |
| `src/utils/set.js` | 33 | 16 | 1 |
| `src/api/build_settings.js` | 42 | 15 | 1 |
| `src/validate/helpers.js` | 36 | 11 | 1 |
| `src/bin/main.js` | 73 | 10 | 1 |
| `src/functions_config.js` | 88 | 10 | 1 |
| `src/options/base.js` | 65 | 9 | 1 |
| `src/validate/identical.js` | 21 | 9 | 1 |
| `src/api/client.js` | 16 | 7 | 1 |
| `src/cached_config.js` | 30 | 7 | 1 |
| `src/utils/group.js` | 11 | 7 | 1 |
| `src/utils/toml.js` | 24 | 5 | 1 |
| `src/env/git.js` | 26 | 4 | 1 |
| `src/options/branch.js` | 37 | 4 | 1 |
| `src/options/feature_flags.js` | 16 | 3 | 1 |
| `src/options/repository_root.js` | 22 | 2 | 1 |
| `src/log/theme.js` | 15 | 0 | 1 |
| `src/validate/validations.js` | 346 | 42 | 2 |
| `src/log/cleanup.js` | 93 | 23 | 2 |
| `src/log/logger.js` | 58 | 14 | 2 |
| `src/mutations/apply.js` | 86 | 14 | 2 |
| `src/merge.js` | 61 | 13 | 2 |
| `src/log/options.js` | 44 | 11 | 2 |
| `src/validate/example.js` | 38 | 10 | 2 |
| `src/validate/main.js` | 153 | 43 | 3 |
| `src/log/messages.js` | 109 | 28 | 3 |
| `src/log/main.js` | 49 | 20 | 3 |
| `src/validate/context.js` | 58 | 21 | 4 |
| `src/options/main.js` | 113 | 19 | 4 |
| `src/default.js` | 32 | 8 | 4 |
| `src/headers.js` | 25 | 4 | 4 |
| `src/inline_config.js` | 10 | 4 | 4 |
| `src/mutations/update.js` | 129 | 31 | 5 |
