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

The build process runs through a series of lifecycle `events`. These events are the places we can hook into and extend
how the Netlify build operates.

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_TABLE) -->

| Lifecycle hook                                                                      | Description                                 |
| :---------------------------------------------------------------------------------- | :------------------------------------------ |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleinit">init</a>** ‏‏‎ ‏‏‎ ‏‏‎                     | Runs before anything else                   |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecyclegetcache">getCache</a>** ‏‏‎ ‏‏‎ ‏‏‎             | Fetch previous build cache                  |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleinstall">install</a>** ‏‏‎ ‏‏‎ ‏‏‎               | Install project dependancies                |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleprebuild">preBuild</a>** ‏‏‎ ‏‏‎ ‏‏‎             | Runs before functions & build commands run  |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecyclefunctionsbuild">functionsBuild</a>** ‏‏‎ ‏‏‎ ‏‏‎ | Build the serverless functions              |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecyclebuild">build</a>** ‏‏‎ ‏‏‎ ‏‏‎                   | Build commands are executed                 |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecyclepostbuild">postBuild</a>** ‏‏‎ ‏‏‎ ‏‏‎           | Runs after site & functions have been built |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecyclepackage">package</a>** ‏‏‎ ‏‏‎ ‏‏‎               | Package & optimize artifact                 |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecyclepredeploy">preDeploy</a>** ‏‏‎ ‏‏‎ ‏‏‎           | Runs before built artifacts are deployed    |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecyclesavecache">saveCache</a>** ‏‏‎ ‏‏‎ ‏‏‎           | Save cached assets                          |
| 🎉 ‏‏‎ **<a href="#lifecyclefinally">finally</a>** ‏‏‎ ‏‏‎ ‏‏‎                      | Runs after anything else                    |

<!-- AUTO-GENERATED-CONTENT:END (LIFECYCLE_TABLE) -->

The Lifecycle flows through events and their `pre` and `post` counterparts.

`pre` happens before a specific event

`post` happens after a specific event

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

## Plugins

Plugins are POJOs (plain old javascript objects) with methods that match the various lifecycle events.

```js
function exampleNetlifyPlugin(config) {
  return {
    // Hook into `init` lifecycle
    init: () => {
      console.log('Do custom thing when buildbot initializes')
    },
    // Hook into `postBuild` lifecycle
    postBuild: () => {
      console.log('Build finished. Do custom thing')
    },
    // ... etc
  }
}
```

## Configuration

Configuration can be written in `toml`, `yml`, `json`, or `json5`.

**Example:**

```yml
# Config file `plugins` defines plugins used by build. Plugins are optional
plugins:
  - type: ./local/path/to/plugin-folder
    config:
      optionOne: 'hello'
      optionTwo: 'there'
  - type: plugin-from-npm
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
