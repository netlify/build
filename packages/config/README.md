# Netlify Config

This library loads, validates, and normalizes the Netlify configuration.

Netlify can be configured:

- In the [build settings](https://docs.netlify.com/configure-builds/get-started/).
- In a [`netlify.toml`](https://docs.netlify.com/configure-builds/file-based-configuration/) file in the repository root
  directory or site `base` directory.

# Install

```bash
npm install @netlify/config
```

# Usage (Node.js)

## getNetlifyConfig(options?)

`options`: `object?`\
_Return value_: `Promise<object>`

```js
const getNetlifyConfig = require('@netlify/config')

const { config, configPath, buildDir, context, branch, token, siteInfo } = await getNetlifyConfig(options)
/*
  {
    "config": {
      "build": {
        "command": "gulp build",
        "commandOrigin": "config",
        "environment": {
          "NETLIFY_BUILD_DEBUG": "true",
          "NODE_VERSION": "12",
          "AWS_LAMBDA_JS_RUNTIME": "nodejs10.x"
        },
        "functions": "/home/me/cv-website/functions",
        "publish": "/home/me/cv-website/build",
        "processing": {
          "css": {
            "bundle": true,
            "minify": true
          },
          "js": {
            "bundle": true,
            "minify": true
          },
          "html": {
            "pretty_urls": true
          },
          "images": {
            "compress": true
          }
        }
      },
      "plugins": [
        {
          "package": "@netlify/plugin-sitemap",
          "inputs": {},
          "origin": "config"
        }
      ]
    },
    "configPath": "/home/me/cv-website/netlify.toml",
    "buildDir": "/home/me/cv-website",
    "context": "production",
    "branch": "master",
    "siteInfo": {
      "id": "418b94bc-93cd-411a-937a-ae4c734f17c4",
      "name": "mick",
      "build_settings": {
        "cmd": "",
        "dir": "",
        "env": { ... },
        "functions_dir": "",
        "base": "",
      },
      ...
    },
    "token": "564194bc-12cd-511a-037a-be4c734f17c4"
  }
*/
```

### Options

The `options` are an optional `object` with the following properties.

Those `options` are automatically set when using `@netlify/config` in the Netlify production CI or with Netlify CLI.

#### debug

_Type_: `boolean`\
_Default value_: `false` unless the `NETLIFY_BUILD_DEBUG` environment variable is set.

Prints debugging information showing the configuration being resolved.

#### buffer

_Type_: `boolean`\
_Default value_: `false`

When using [`debug`](#debug), returns the `logs` instead of printing them on the console.

#### config

_Type_: `string`

Path to the `netlify.toml`. It is either an absolute path or a path relative to the [`cwd`](#cwd).

If not specified, it is searched in the following directories (by highest priority order):

- `base` directory
- [`repositoryRoot`](#repositoryRoot)
- current directory
- any parent directory

Otherwise, no `netlify.toml` is used.

#### repositoryRoot

_Type_: `string`\
_Default value_: see [`cwd`](#cwd)

Repository root directory. This is used in the following cases:

- Searching for the `netlify.toml` (see [`config`](#config))
- When a `base` directory was specified, its path is relative to the repository root directory
- The `functions` and `publish` directories are relative to the repository root directory or (if specified) the `base`
  directory
- Determining the [build directory](#builddir)

If not specified, it is automatically guessed by looking for any `.git` directory from the [`cwd`](#cwd), and up. If
none is found, the [`cwd`](#cwd) is used instead.

#### cwd

_Type_: `string`\
_Default value_: `process.cwd()`

Current directory. This is used in the following cases:

- Searching for the `netlify.toml` (see [`config`](#config))
- Searching for the [`repositoryRoot`](#repositoryroot)
- In a monorepo, when stepping inside a specific package in the console, that package is automatically used as `base`
  directory

#### context

_Type_: `string`\
_Default value_: environment variable `CONTEXT`, or `"production"`

[Deploy context](https://docs.netlify.com/site-deploys/overview/#deploy-contexts).

The `netlify.toml` can contain `contexts.{CONTEXT}` properties, which are like `build` properties but only applied when
`{CONTEXT}` matches.

#### branch

_Type_: `string`\
_Default value_: environment variable `BRANCH`, current `git` branch, or `"master"`

Same as [`context`](#context) but using a `git` branch name.

#### token

_Type_: `string`\
_Default value_: environment variable `NETLIFY_AUTH_TOKEN`

Netlify API token.

This is used to retrieve [`siteInfo`](#siteinfo).

#### siteId

_Type_: `string`\
_Default value_: environment variable `NETLIFY_SITE_ID`

Netlify Site ID.

This is used to retrieve [`siteInfo`](#siteinfo).

#### env

_Type_: `object`

Environment variable to use, in addition to the current `process.env`. This is used as the default values of other
options.

#### mode

_Type_: `string`\
_Default value_: `"require"`

What is calling `@netlify/config`. Can be:

- `"buildbot"`: Netlify production CI
- `"cli"`: Netlify CLI
- `"require"`: anything else

This is used for the following cases:

- if `mode` is `buildbot`, the [`siteInfo`](#siteinfo) is not retrieved because it is also passed using another internal
  option.

#### defaultConfig

_Type_: `string`

Configuration object used as default. This is an object serialized with JSON.

#### inlineConfig

_Type_: `object`

Configuration object overriding any properties. This is a JavaScript object.

### Return value

The return value is a `Promise` resolving to an `object` with the following properties.

#### config

_Type_: `object`

Resolved configuration object.

#### configPath

_Type_: `string?`

Absolute path to the `netlify.toml`, if any.

#### buildDir

_Type_: `string`

Absolute path to the build directory.

The build directory is the current directory in which most build operations, including the build command, execute. It is
usually either the [`repositoryRoot`](#repositoryRoot) or (if specified) the `base` directory.

#### context

_Type_: `string`

Resolved context. See the [`context`](#context) option.

#### branch

_Type_: `string`

Resolved git branch. See the [`branch`](#branch) option.

#### siteInfo

_Type_: `string?`

Netlify Site information retrieved using the `getSite` Netlify API endpoint. This is used to retrieve Build settings set
in the Netlify App: plugins, Build command, Publish directory, Functions directory, Base directory, Environment
variables.

This might not be available depending on the options passed.

#### token

_Type_: `string`

Netlify API token. This takes into account the [`token`](#token) option but also some Netlify-specific environment
variables.

#### api

_Type_: `NetlifyClient?`

Netlify [JavaScript client instance](https://github.com/netlify/js-client) used to retrieve the [`siteInfo`](#siteinfo).

#### logs

_Type_: `object?`

When the [`buffer`](#buffer) option is used, this contains two arrays `stdout` and `stderr` with the logs.

# Usage (CLI)

```bash
$ netlify-config
```

Like [`getNetlifyConfig()`](getnetlifyconfigoptions), but in the CLI. The return value is printed on `stdout`.

The CLI flags use the same options.
