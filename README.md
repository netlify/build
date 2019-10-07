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
- Works locally & in any CI/CD context

## How it works

Build steps are codified in the Netlify UI or via `netlify` config file in the `build.lifecycle` or as `plugins`.

Builds are controlled by a series of lifecycle events that `plugins` & configuration (`build.lifecycle`) hook into.

## Lifecycle

The Netlify build lifecycle consists of these `events`

Events are activities happening in the build system.

```js
const lifecycle = [
  /* ↓ Build initialization steps */
  'init',
  /* Fetch previous build cache */
  'getCache',
  /* Install project dependancies */
  'install',
  /* Build the site & functions */
  'build',
  'buildSite',
  'buildFunctions',
  /* Package & optimize artifact */
  'package',
  /* Deploy built artifact */
  'deploy',
  /* Save cached assets */
  'saveCache',
  /* Outputs manifest of resources created */
  'manifest'
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
{
  name: 'my-awesome-plugin',
  init: () => { /* Run custom logic at beginning of build */ }
  preBuild: () => { /* Run custom logic before build happens */ },
  finally: () => { /* Run custom logic at the end of the build */ }
  // ... etc
}
```

Here is an example:

```js
/* file ./plugins/my-plugin/index.js */
module.exports = function exampleOne(config) {
  // do initial things with plugin 'config'
  return {
    init: () => {
      console.log('Run custom logic at beginning of build')
    },
    preBuild: () => {
      console.log('Run custom logic before build happens')
    },
    postBuild: () => {
      console.log('Run custom logic after build happens')
    },
    finally: () => {
      console.log('Run custom logic at the end of the build')
    },
  }
}
```

To use this plugin, define the `plugins` key in your Netlify config file.


```yml
build:
  functions: src/functions
  publish: build
  command: npm run build

# Netlify build plugins
plugins:
  examplePlugin:
    # Path to plugin. Can be local relative path or reference to node_modules
    type: ./plugins/my-plugin/
    config:
      a: hello
      b: goodbye
```

### Plugin Examples

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
  pluginAbc:
    type: ./local/path/to/plugin-folder
    config:
      optionOne: 'hello'
      optionTwo: 'there'
 pluginTwo:
   type: plugin-from-npm
   config:
     optionOne: 'neat'
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
    preBuild: echo "${env:privateKey}"
    build: |
      echo 'Hello Netlify Build!'
      npm run build
```

Configuration now supports `environment` variables & `secrets`.

To reference an environment variable in Netlify config:

```yml
foo: ${env:MY_ENV_VAR}
```

## CLI commands

```
netlify build
```

Test out the build flow. This will output everything that happens in the build flow without executing the plugins.

```
netlify build --dry
```

## Setting up the project

1. Clone down the repo

```
git clone git@github.com:netlify/netlify-build.git
```

2. Install project dependancies

```
npm install && npm run bootstrap
```
