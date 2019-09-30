# Example Site for Netlify Build

This is a demo site showcasing the new Netlify Build features & lifecycle hooks.

## Setup

Install dependancies

```
npm install
```

Run build lifecycle in "dry run" mode.

```
npm run plan
```

Run build lifecycle

```
npm run go
```

## About

Netlify build is the next generation of CI/CD tooling for modern web applications.

It is designed to support any kind of build flow and is extendable to fit any unique project requirements.

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

The Lifecycle flows through events and their `*Start` and `*End` counterparts.

`*Start` happens before a specific event

`*End` happens before a specific event

```
      ┌───────────────┬────────────────┬──────────────────┐
      │    *Start     │     event      │       *End       │
      ├───────────────┼────────────────┼──────────────────┤
      │               │                │                  │
      │               │                │                  │
...   │  buildStart   │     build      │     buildEnd     │   ...
      │               │                │                  │
      │               │                │                  │
      └───────────────┤                ├──────────────────┘
                      └────────────────┘

      ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ▶

                        event flow
```

**Example:**

`buildStart` runs first, then `build`, then `buildEnd` in that order.

This applies to all lifecycle events listed above.

## Plugins

Plugins are POJOs (plain old javascript objects) with methods that match the various lifecycle events.

```js
function exampleNetlifyPlugin(config) {
  return {
    // Hook into `init` lifecycle
    init: () => {
      console.log('Do custom thing when buildbot initializes')
    },
    // Hook into `buildEnd` lifecycle
    buildEnd: () => {
      console.log('Build finished. Do custom thing')
    }
    // ... etc
  }
}
```

**Examples:**

- **netlify-plugin-lighthouse** to automatically track your lighthouse site score between deployments
- **netlify-plugin--cypress** to automatically run integration tests
- **netlify-plugin--tweet-new-post** to automatically share new content via twitter on new publish
- **netlify-plugin--sitemap** to generate sitemaps after build
- **netlify-plugin--notify** to automatically wired up build notifications
- ... skys the limit 🌈

## Configuration

Configuration can be written in `toml`, `yml`, `json`, `json5`, or `javascript`.

**Example:**

```yml
# Config file `plugins` defines plugins used by build. Plugins are optional
plugins:
  - ./localpath/plugin-folder:
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
    buildStart: echo "${secrets:privateKey}"
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

## CLI commands

```
netlify build
```

Test out the build flow. This will output everything that happens in the build flow without executing the plugins.

```
netlify build --dry-run
```

## Simplified Build Env

The folder structure of the build environment is also being revamped to streamline & simplify how users interact with it.

- `.netlify` - Main folder
- `.netlify/src` - Source code from repo, zip, tar
- `.netlify/cache` - Files persisted across builds
- `.netlify/cache/dependencies` - All dependencies are cache here. These are used for lookup / install process.
- `.netlify/build` - Built files
