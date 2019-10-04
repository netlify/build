# Netlify Build

Netlify build is the next generation of CI/CD tooling for modern web applications.

It is designed to support any kind of build flow and is extendable to fit any unique project requirements.

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Expand Table of Contents) -->
<details>
<summary>Expand Table of Contents</summary>

- [Design principles](#design-principles)
- [How it works](#how-it-works)
- [Lifecycle](#lifecycle)
- [Plugins](#plugins)
- [Configuration](#configuration)
- [Build Environment](#build-environment)
  - [Directories](#directories)
  - [Environment variables](#environment-variables)
- [CLI commands](#cli-commands)
- [Setting up the project](#setting-up-the-project)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Design principles

- Extendable core
- Modular components
- Works in CI/CD & local context

## How it works

Build steps are codified in the Netlify UI or via `netlify` config file.

Builds are controlled by a series of lifecycle hooks that `plugins` & configuration hook into.

## Lifecycle

The Netlify build lifecycle consists of these `events`

Events are activities happening in the build system.

```js
const lifecycle = [
  /* ↓ Build initialization steps */
  'init',
  /* ↓ Fetch previous build cache */
  'getCache',
  /* ↓ Install project dependancies */
  'install',
  /* ↓ Build the site & functions */
  'build',
  /* ↓ Package & optimize artifact */
  'package',
  /* ↓ Deploy built artifact */
  'deploy',
  /* ↓ Save cached assets */
  'saveCache',
  /* ↓ Outputs manifest of resources created */
  'manifest',
  /* ↓ Build finished */
  'finally'
]
```

The Lifecycle flows through events and their `pre` and `post` counterparts.

`pre` happens before a specific event

`post` happens before a specific event

```
      ┌───────────────┬────────────────┬──────────────────┐
      │      pre      │     event      │       post       │
      ├───────────────┼────────────────┼──────────────────┤
      │               │                │                  │
      │               │                │                  │
...   │   preBuild    │     build      │    postBuild     │   ...
      │               │                │                  │
      │               │                │                  │
      └───────────────┤                ├──────────────────┘
                      └────────────────┘

      ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ▶

                        event flow
```

**Example:**

`preBuild` runs first, then `build`, then `postBuild` in that order.

This applies to all lifecycle events listed above.

By default, Netlify build will execute all steps in the config file and instantly fail the build, if any lifecycle step throws an error. 

## Plugins

Plugins are POJOs (plain old javascript objects) with methods that match the various lifecycle events.

```js
function exampleNetlifyPlugin(initialConfig) {
  return {
    name: 'my-awesome-plugin',
    /* Define the netlify API methods required if plugin making calls with netlify SDK */
    scopes: ['listSites'],
    /**
     * [init description]
     * @param  {object} config          - Current netlify configuration from config file
     * @param  {object} pluginConfig    - Initial plugin configuration
     * @param  {object} utils        [description]
     * @return {[type]}              [description]
     */
    init: ({ config, pluginConfig, utils, constants, api }) => {
      const { siteId, siteUrl, /*siteConfig*/, deployUrl } = context
      console.log(`Current site id`, siteId)
      console.log(`Current live site url`, siteUrl)
      console.log(`Current siteConfig`, siteConfig)
      console.log(`Current immutable deploy url`, deployUrl)
      console.log(`Current working directory`, cwd)
      /* Plugin config */
      console.log('Current plugin config', pluginConfig)
      /* config */
      console.log('Current netlify config from config file', config)
    },
    // Hook into `postBuild` lifecycle
    postBuild: () => {
      console.log('Build finished. Do custom thing')
    }
    // ... etc
  }
}
```

**Examples:**

- **netlify-plugin-lighthouse** to automatically track your lighthouse site score between deployments
- **netlify-plugin-cypress** to automatically run integration tests
- **netlify-plugin-tweet-new-post** to automatically share new content via twitter on new publish
- **netlify-plugin-sitemap** to generate sitemaps after build
- **netlify-plugin-notify** to automatically wired up build notifications
- **netlify-plugin-a11y-axe** to automatically audit site for accessibility issues
- **netlify-plugin-twiliosms** text your boss every time you deploy so they know you're working
- **netlify-plugin-svgoptimizer** to automatically optimize all SVGs in a directory when the site is built
- ... skys the limit 🌈

## Configuration

Configuration can be written in `toml`, `yml`, `json`, `json5`, or `javascript`.

**Example:**

```yml
# Config file `plugins` defines plugins used by build. Plugins are optional
plugins:
  - ./localpath/plugin-folder:
      timeout: 5m
      enabled: true
      secrets:
        shhh: 'only accessible via this plugin'
      optionOne: 'hello'
      optionTwo: 'there'
  - plugin-from-npm:
      optionOne: 'neat'
  - other-plugin-from-npm::
      arrayOfValues:
        - david@netlify.com
        - jim@netlify.com

# Inline `build.lifecycle` steps can be defined
build:
  lifecycle:
    init:
      - npm run foo
      - export VALUE=lol
      - echo "much wow"
    getCache:
      - echo 'curl custom cache'
    preBuild: echo "${secrets:privateKey}"
    build: |
      echo 'Hello Netlify Build!'
      npm run build
```

Configuration now supports `environment` variables & `secrets`.

To reference an environment variable in Netlify config:

```yml
foo: ${env:MY_ENV_VAR}
```

To reference a secret in Netlify config:

```yml
bar: ${secrets:MY_REMOTE_SECRET}
```

## Simplified Build Env

The folder structure of the build environment is also being revamped to streamline & simplify how users interact with it.

- `.netlify` - Main folder
- `.netlify/src` - Source code from repo, zip, tar
- `.netlify/cache` - Files persisted across builds
- `.netlify/cache/dependencies` - All dependencies are cache here. These are used for lookup / install process.
- `.netlify/build` - Built files

## CLI commands

```
netlify build
```

Test out the build flow. This will output everything that happens in the build flow without executing the plugins.

```
netlify build --dry-run
```

## Setting up the project

1. Clone down the repo

```
git clone git@github.com:netlify/netlify-build.git
```

2. Install project dependancies

```
npm i && npm run bootstrap
```
