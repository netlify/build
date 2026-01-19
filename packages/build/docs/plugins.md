# Build plugins

## Installation

Plugins can be installed in four ways.

### package.json

Plugins can be added to `package.json`. Those are
[installed alongside other site dependencies](https://github.com/netlify/build-image/blob/195fbe127e5c374d9c4758652cb62e3b8936a395/run-build-functions.sh#L201)
by [the `build-image`](https://github.com/netlify/build-image) to `node_modules/` in the build directory.

### UI

Plugins can be added from the Netlify UI.

Unlike other methods, this
[only works](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/expected_version.js#L87)
for plugins [listed in `plugins.json`](https://github.com/netlify/plugins/blob/main/site/plugins.json).

Unlike `package.json` plugins, those plugins are installed by Netlify Build, by making
[manual `npm install` or `yarn`](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/install/missing.js#L16).
The plugins are installed in `.netlify/plugins/node_modules/` in the build directory.

#### netlify.toml-only plugins

Plugins can be added to `netlify.toml` but without being specified in either the UI or `package.json`.

This method is deprecated and undocumented. It behaves the same way as if the plugin had been added from the UI.

### Local plugins

Plugins can
[also be local files](https://github.com/netlify/build/blob/71b84fc564bef6349bd550ef588ee5d72dc1d0cd/packages/build/src/plugins/resolve.js#L82).
The file path is specified directly in `netlify.toml`.

### Core plugins

Core plugins
[are added by Netlify Build itself](https://github.com/netlify/build/blob/71b84fc564bef6349bd550ef588ee5d72dc1d0cd/packages/build/src/plugins_core/list.js#L20),
i.e. are inside Netlify Build's codebase.

This method is deprecated and [is expected to be removed](https://github.com/netlify/pillar-workflow/issues/113).

## plugins.json

### Purpose

Plugins available in the UI must be registered in a
[JSON file named `plugins.json`](https://github.com/netlify/plugins/blob/main/site/plugins.json).

Plugin authors must submit new plugins and releases to that repository for quality control.

### Deployment

That repository
[is deployed](https://github.com/netlify/plugins/blob/08ce54230b0c412776bc0e1ea697204c380f5087/index.js#L11) to
[a Netlify site](https://list-v2--netlify-plugins.netlify.app/plugins.json), which is
[fetched by Netlify Build](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/list.js#L32).
The HTTP request almost never fails, but when it does, we
[fallback to a Node module](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/list.js#L39-L48).

### Fields

The most important fields are the package `name` and last `version`.

A `compatibility` field is available for previous major releases (not minor/patch), allowing plugin authors to make
breaking changes without impacting existing users. When absent, it
[defaults to the top `version` field](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/list.js#L70).

Specific `compatibility` versions can be toggled with LaunchDarkly
[using a `featureFlag` field](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/expected_version.js#L78).

They can also
[declare "conditions"](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/compatibility.js#L125)
for sites to use specific versions. At the moment, those can be:

- The site's Node.js version
  ([`nodeVersion` field](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/compatibility.js#L78))
- The site's dependencies and their version
  ([`siteDependencies` field](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/compatibility.js#L86))

## Versioning

### Logging

Each build
[logs the list of plugins](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/log/messages/compatibility.js#L8)
being run and their versions.

If debug mode is enabled, the following is also logged:

- [List of available plugins](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/log/messages/plugins.js#L12)
  and their versions
- [Latest, expected, compatible and pinned versions](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/log/messages/compatibility.js#L46)

### Pinned version

We ensure that plugins can release breaking changes in a backward compatible way by pinning their major version.
[This happens on a site by site basis](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/pinned_version.js#L41),
after the plugin has been successfully run once. This is done by making
[an API call to update `site.plugins[*].pinned_version`](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/pinned_version.js#L111-L115).

This only applies to UI plugins, since the other types of plugins do not need it.

The pinned version is retrieved at the beginning of the build:

- In production, those are passed by the Bitballon API to the buildbot, which forwards those to Netlify Build.
  - If the plugin was installed only in `netlify.toml`, Netlify Build makes
    [an API call](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/pinned_version.js#L16)
    to retrieve that information instead. It uses the version used by the latest successful plugin run.
- In CLI builds, an
  [API call is made instead](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/config/src/api/build_settings.js#L36).

### Expected version

The "expected version" is the version that should be used by Netlify Build for a given UI plugin. It is used to install
that plugin when it is either
[not installed](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/expected_version.js#L89),
or
[outdated](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/expected_version.js#L91).

Its value is computed from `plugins.json` using the most recent `compatibility[*].version`
[matching the pinned version](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/compatibility.js#L45).
If no version is pinned, the most recent `compatibility[*].version` matching the
[version "conditions" is used instead](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/compatibility.js#L49).

### Latest version

[The "latest version"](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/expected_version.js#L56)
is the most recent version specified in `plugins.json` for a given plugin, regardless of version pinning or
"conditions".

It is only used to log a warning message when we detect that the plugin version is older, i.e.
[is outdated](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/log/messages/compatibility.js#L72).
If the `plugins.json`
[specifies a `migrationGuide` URL](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/expected_version.js#L56)
for the "latest version", that is
[logged as well](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/log/messages/compatibility.js#L106).

### Compatible version

The "compatible version" is
[the most recent version that satisfies](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/expected_version.js#L59)
the site "conditions", regardless of site pinning.

It is only
[used to log](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/log/messages/compatibility.js#L124)
a warning message
([internally called `compatWarning`](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/compatibility.js#L68))
when the plugin version is too recent based on those "conditions".

## Node.js version

The
[following file](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/node_version.js#L13)
and [documentation](https://github.com/netlify/buildbot/blob/master/docs/node_version.md#which-nodejs-version-is-used)
describe which Node.js version is used by Build plugins.

Furthermore, plugins can specify minimal Node.js versions in their `package.json` `engines` field. Netlify Build fails
builds when a site uses a Node.js version incompatible with
[one of its plugins](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/node_version.js#L34).
Plugins doing so should also add a `nodeVersion` "condition" to the `plugins.json`.

## Initialization

Before Build plugins are loaded and run, Netlify Build computes some information about them:

- The absolute path
  [to their main file](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/resolve.js#L14)
- The
  [plugin's version](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/expected_version.js#L13)
- The
  [Node.js version to use](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/node_version.js#L13)
- Whether the plugin should
  [first be installed](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/resolve.js#L127)
- The
  [plugin's `package.json`](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/options.js#L62)
- [The `manifest.yml`](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/manifest/main.js#L8),
  which is used to:
  - [Assign default values](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/manifest/check.js#L30)
  - Validate against
    [missing](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/manifest/check.js#L44)
    or
    [unknown](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/manifest/check.js#L65)
    inputs. Plugin inputs allow users to configure plugins in their `netlify.toml`.

## Child processes

Build plugins
[are run in separate child processes](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/spawn.js#L33)
for
[security, reliability and logging purposes](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/spawn.js#L15-L19).
The plugin's process's current directory
[is the build directory](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/spawn.js#L35).

We control which environment variables
[are passed to that process](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/spawn.js#L40).
We also
[modify the `PATH` environment variable](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/spawn.js#L36-L37)
to allow plugins to call any binary added to the `package.json` of either the site or the plugin itself.

The path to Node.js binary
[is passed as an option](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/spawn.js#L38-L39),
which is how we allow plugins to use different Node.js versions.

## Plugin run

### IPC

Plugin processes
[communicate with Netlify Build's main process](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/ipc.js#L19)
using
[the `ipc` mechanism built in Node.js](https://nodejs.org/api/child_process.html#subprocesssendmessage-sendhandle-options-callback).

We wrap the plugin with
[some logic](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/main.js#L9)
to handle that inter-process communication. That logic also
[handles exceptions](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/error.js#L9)
and
[unexpected process exits](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/ipc.js#L68).

### Events

#### `ready`

Once the plugin process has been spawned, the
[parent process waits](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/spawn.js#L46)
for a
[`ready` event from it](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/main.js#L19).

#### `load`

The parent process then
[sends a `load` event](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/load.js#L46):

- This
  [instructs the child process](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/load.js#L12)
  to
  [`import()` the plugin's main file](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/logic.js#L10).
- If the plugin uses TypeScript and does not run `tsc` before `npm publish`,
  [`tsx` is registered first](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/typescript.js#L11)
  to transpile it on-the-fly. This is useful for TypeScript plugin authors to test their plugins in production.
- The plugin's shape
  [is also validated](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/validate.js#L6).

#### `run`

Each event handler exported by the plugin
[is executed](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/steps/plugin.js#L40)
by a series
[of `run` events](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/run.js#L8).

The event handler function is
[passed many useful arguments](https://github.com/netlify/build/blob/509efdfe5fd41bdbeb3b9e930b07ac984531b785/packages/build/src/plugins/child/run.js#L16):
`utils`, `constants`, `inputs`, `netlifyConfig` and the site's `packageJson`.
