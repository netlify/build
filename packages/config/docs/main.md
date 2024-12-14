# Netlify configuration

## Purpose

The goal of `@netlify/config` is to abstract the logic that loads, normalizes and validates the Netlify configuration
(`netlify.toml`, UI build settings, `_headers`, `_redirects`, etc.). It returns a single normalized object to consumers.

Note: while `@netlify/build` share the same monorepo, it has a very distinct purpose.

## Consumers

At the moment, `@netlify/config` is used by four parts of Netlify's architecture. It might also be used by additional
consumers in the future, including outside of Netlify.

It is possible to distinguish between those different consumers using the [`mode` flag](../README.md#mode) which is set
to `"buildbot"`, `"cli"` or `"require"` by each of them. However, we try to limit the usage of that flag as much as
possible:

- Instead, we want those different modes to behave as similarly to each other as possible, especially Netlify CLI and
  buildbot.
- There are some cases where those different environments do require different logic. When this happens, we try to add
  new flags to toggle each specific behavior, as opposed to rely on the `mode` flag which would be less composable and
  re-usable.

### Programmatic vs CLI

There is both
[a CLI](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/bin/main.js#L16)
and
[programmatic entry point](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/main.js#L30).

To ensure both entry points re-use as much logic as possible, we try to minimize the amount of CLI-specific logic. At
the moment, the CLI code only includes some logic that makes sense exclusively within that context: exit code, CLI flags
parsing, terminal output.

By default, the CLI entry point prints to `stdout`. However,
[an `--output` flag](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/bin/main.js#L38)
is used
[by the buildbot](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/bot/configuration.go#L129)
to print to a file instead, which avoids crashing the process when the configuration object is very big.

### Buildbot

The buildbot logic uses multiple configuration properties: build directory, Functions directory, etc.Therefore,
[`@netlify/config` is called via the CLI](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/bot/configuration.go#L120)
(since the buildbot is written in a different language) at the beginning of each build.

`@netlify/config` is installed
[at Docker build time](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/package.json#L12)
by the buildbot. It is run with
[a hardcoded Node.js version](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/script/install-nvm.sh#L16).

### Netlify Build

`@netlify/build` also
[loads the configuration object](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/build/src/core/config.js#L107)
with `@netlify/config`, but programmatically.

Since the buildbot already loads that same object, we cache it
[as a `cachedConfig` object](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/script/run-build.sh#L75)
so `@netlify/build` does not need to re-compute it. This also ensures `@netlify/build` and the buildbot use the exact
same configuration properties.

#### Build plugins

Build plugins can both access and modify the Netlify configuration normalized object returned by `@netlify/config` using
[a `netlifyConfig` property passed to them](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/build/src/plugins/child/run.js#L16).

[When modified](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/build/src/plugins/child/diff.js#L21),
`@netlify/config`
[is called again](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/build/src/core/config.js#L126).
It is also called again when a build command or plugin
[adds a `_headers` or `_redirects` file](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/build/src/steps/update_config.js#L59).

The new configuration properties are printed, with some additional information when in debug mode.

The configuration mutations
[are stored in an `inlineConfig` object](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/mutations/apply.js#L14),
which is
[passed as a flag to `@netlify/config`](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/build/src/steps/update_config.js#L13)
and has the highest merging priority.

The logic in `@netlify/build` takes into account that the Netlify configuration can be mutated at any point. While most
configuration properties can be mutated,
[some are still read-only](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/mutations/apply.js#L52)
due to that additional complexity.

In production, any configuration mutation
[is temporarily persisted to `netlify.toml`](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/mutations/update.js#L17)
before deploying the site, and restored afterwards.

### Netlify CLI

Most Netlify CLI commands rely on configuration properties. The base command loads it
[using `@netlify/config` programmatically](https://github.com/netlify/cli/blob/f87d9e6e1749bedaabaace3dae98ca1ed6d84fd6/src/commands/base-command.js#L474).

An `inlineConfig` flag was added to `@netlify/config` so Netlify CLI can override specific configuration properties
based on its own CLI flags, but this is not used yet (see <https://github.com/netlify/cli/issues/1265>,
<https://github.com/netlify/cli/issues/960>, <https://github.com/netlify/cli/issues/961>).

We try to
[emulate the same environment variables](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/env/main.js#L13)
as on the buildbot, as much as possible.

### Automated tests

A few flags are available for programmatic users. Those are mostly used by our automated tests:

- [The `testOpts` flag](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/bin/flags.js#L153)
- [The `buffer` flag](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/bin/flags.js#L166)
  which allows returning the output programmatically instead of printing it on the terminal

## File paths

The Netlify configuration relies on many file paths. Those are documented [here](file_paths.md).

## UI build settings

Users can specify the configuration either in files (`netlify.toml`, `_headers`, `_redirects`) or in the Netlify UI
("build settings"). The latter has lower merging priority.

UI build settings are passed to `@netlify/config` using
[the `defaultConfig` flag](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/default.js#L6).

In the buildbot, this is populated
[with some values](https://github.com/netlify/buildbot/blob/7383bb8971c718de9618a700ec5049cb71af7102/bot/buildbot.go#L135-L144)
coming from the backend API.

When called from the Netlify CLI, API calls to the backend
[are being made](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/api/site_info.js#L24)
to retrieve
[those values](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/api/build_settings.js#L7).
This relies on multiple flags:

- The
  [`token`](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/api/client.js#L7)
  and
  [`siteId`](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/api/site_info.js#L30)
  flags require the site to have been linked locally and the user to be logged in.
- [The `host`, `scheme` and `pathPrefix` flags](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/api/client.js#L12)
  allow overriding the API endpoint URL.
- [The `offline` flag](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/api/client.js#L7)
  can disable this.

## Headers and redirects

Redirects configuration is more complicated:

- It has multiple properties
- It can be specified either in `netlify.toml` or in a separate `_redirects` file located in the publish directory and
  with its own Netlify-specific file format

Therefore, that logic is abstracted to [its own module `@netlify/redirect-parser`](../../redirect-parser).

Headers are handled very similarly to redirects, for consistency. They use a separate `_headers` file
[and `@netlify/headers-parser` module](../../headers-parser).

## Context-specific configuration

Users can make some configuration specific to a given context or branch. Those are specified by embedding a
configuration object inside the main one, but namespaced with `context.{context|branch}.*`. `@netlify/config`
[merges those with higher priority](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/context.js#L28),
but only if the current context or branch matches.

Those are specified with:

- The `context` flag, which
  [defaults to `"production"`](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/options/main.js#L42)
- The `branch` flag,
  [which defaults](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/options/branch.js#L9)
  to the `BRANCH` environment variable, `HEAD` branch, `main` branch or `"master"` (this name was kept for backward
  compatibility).

## Normalization and validation

As described above, the final configuration object is a product of multiple merges:

- The configuration object loaded from:
  - Files (`config`)
  - The UI build settings (`defaultConfig`)
  - Build plugins modifications (`inlineConfig`)
- Context/branch-specific properties

As a result, normalization and validation happens
[in multiple stages](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/main.js#L259).
For example, we need to validate that `context` is a plain object before merging context properties. However, since the
build command might be specified either in `context` properties or not, we can only validate it after those have been
merged.

Additionally, we keep track of where the property was originally set
[with sibling properties named `origin`](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/origin.js#L11).
At the moment, this is mostly used for logging and debugging purposes. For example, the build logs show whether the
build command was set in `netlify.toml` or in the UI.

Almost all `@netlify/config` errors are user configuration errors. To help both users debug those problems and support
focus on actual system bugs, we enforce some strict configuration
[validation](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/validate/validations.js#L40).
Error messages are printed in the build logs with a nice format and examples on how to fix them. This logic relies on
declaring each configuration property's shape and example values
[in the following file](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/validate/validations.js#L40).
This requires some (sometimes tedious) maintenance, but improves the developer experience.

The configuration object is normalized, which includes:

- Assigning
  [default values](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/normalize.js#L22-L32)
- Allowing some properties
  [to be capitalized](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/case.js#L2),
  for backward compatibility
- [Normalizing the Functions-related properties](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/functions_config.js#L11),
  which are rather complex and polymorphic

## Debugging

A `debug` flag can be used
[to log the flags and configuration object](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/config/src/log/main.js#L6)
at different stages of the logic. It can enabled with the `NETLIFY_BUILD_DEBUG` environment variable as well.

We make sure that no secret information is ever logged by this debugging feature.
