# Netlify Build

Netlify build is the next generation of CI/CD tooling for modern web applications.

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Expand Table of Contents) -->
<details>
<summary>Expand Table of Contents</summary>

- [Background](#background)
- [How it works](#how-it-works)
  * [1. Extending via config](#1-extending-via-config)
  * [2. Extending via plugins](#2-extending-via-plugins)
- [Lifecycle](#lifecycle)
  * [lifecycle.init](#lifecycleinit)
  * [lifecycle.getCache](#lifecyclegetcache)
  * [lifecycle.install](#lifecycleinstall)
  * [lifecycle.preBuild](#lifecycleprebuild)
  * [lifecycle.functionsBuild](#lifecyclefunctionsbuild)
  * [lifecycle.build](#lifecyclebuild)
  * [lifecycle.postBuild](#lifecyclepostbuild)
  * [lifecycle.package](#lifecyclepackage)
  * [lifecycle.preDeploy](#lifecyclepredeploy)
  * [lifecycle.saveCache](#lifecyclesavecache)
  * [lifecycle.finally](#lifecyclefinally)
- [Configuration](#configuration)
- [Plugins](#plugins)
  * [What can plugins do?](#what-can-plugins-do)
- [CLI commands](#cli-commands)
- [Setting up the project](#setting-up-the-project)
  * [Packages](#packages)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Background

During a site build, there are a variety of things happening under the hood.

This is a simplified view of a typical build life cycle:

1. Netlify clones your repo & looks for diffs
2. Dependencies are install in the project
3. We run your build command
4. Files & dependencies are cached
5. Finally, your site is deployed to the web!

Historically, when connecting your site to Netlify, we ask for the build command (step 3 above) and will run through this process. This works great for most use cases & will continue to do so 😃

For builds that require a little more flexibility, we are introducing a programatic interface on top of these build lifecycle steps to allow users to customize this flow.

**Netlify Build** is designed to support any kind of build flow and is extendable to fit any unique project requirements.

## How it works

Builds are controlled by a series of [lifecycle](#lifecycle) events that `plugins` & configuration hook into.

**The [build lifecycle](#lifecycle) can be extended in two ways:**

1. Adding lifecycle steps to `build.lifecycle` in your [config file](#extending-via-config)
2. Installing pre-packaged [plugins](#plugins)

### 1. Extending via config

Inside the netlify config file, you can attach [lifecycle](#lifecycle) commands to a new property `build.lifecycle`.

```yml
build:
  publish: my-dist-folder
  # Run this lifecycle during build
  lifecycle:
    init:
      - npm run thing
      - echo "much wow"
    preBuild: curl download-static-content
    build: npm run build
    postBuild:
      - npx generate-sitemap
```

### 2. Extending via plugins

[Netlify Plugins](#plugins) are installable packages that extend the functionality of the netlify build process.

They can be installed from `npm` or run locally from relative path in your project.

```yml
# Config file `plugins` defines plugins used by build.
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
```

## Lifecycle

The build process runs through a series of lifecycle `events`. These events are the places we can hook into and extend how the Netlify build operates.


<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_TABLE) -->
| Lifecycle hook | Description |
|:------|:-------|
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecycleinit">init</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Runs before anything else |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecyclegetcache">getCache</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Fetch previous build cache |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecycleinstall">install</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Install project dependancies |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecycleprebuild">preBuild</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Runs before functions & build commands run |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecyclefunctionsbuild">functionsBuild</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Build the serverless functions |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecyclebuild">build</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Build commands are executed |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecyclepostbuild">postBuild</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Runs after site & functions have been built |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecyclepackage">package</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Package & optimize artifact |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecyclepredeploy">preDeploy</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Runs before built artifacts are deployed |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **<a href="#lifecyclesavecache">saveCache</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Save cached assets |
| 🎉 ‏‏‎ **<a href="#lifecyclefinally">finally</a>** ‏‏‎  ‏‏‎  ‏‏‎  | Runs after anything else |
<!-- AUTO-GENERATED-CONTENT:END (LIFECYCLE_TABLE) -->

The Lifecycle flows the events in order and executes and their `pre` & `post` counterparts.

`pre` happens before a specific event.

`post` happens before a specific event.

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


<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_DOCS) -->
### lifecycle.init

`init` - Runs before anything else


<details>
  <summary>Using init</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `init` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      init: () => {
        console.log("Do thing on init step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    init:
      - echo "Do thing on init step"
```

</details>

### lifecycle.getCache

`getCache` - Fetch previous build cache


<details>
  <summary>Using getCache</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `getCache` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      getCache: () => {
        console.log("Do thing on getCache step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    getCache:
      - echo "Do thing on getCache step"
```

</details>

### lifecycle.install

`install` - Install project dependancies


<details>
  <summary>Using install</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `install` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      install: () => {
        console.log("Do thing on install step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    install:
      - echo "Do thing on install step"
```

</details>

### lifecycle.preBuild

`preBuild` - Runs before functions & build commands run


<details>
  <summary>Using preBuild</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `preBuild` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      preBuild: () => {
        console.log("Do thing on preBuild step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    preBuild:
      - echo "Do thing on preBuild step"
```

</details>

### lifecycle.functionsBuild

`functionsBuild` - Build the serverless functions


<details>
  <summary>Using functionsBuild</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `functionsBuild` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      functionsBuild: () => {
        console.log("Do thing on functionsBuild step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    functionsBuild:
      - echo "Do thing on functionsBuild step"
```

</details>

### lifecycle.build

`build` - Build commands are executed


<details>
  <summary>Using build</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `build` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      build: () => {
        console.log("Do thing on build step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    build:
      - echo "Do thing on build step"
```

</details>

### lifecycle.postBuild

`postBuild` - Runs after site & functions have been built


<details>
  <summary>Using postBuild</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `postBuild` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      postBuild: () => {
        console.log("Do thing on postBuild step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    postBuild:
      - echo "Do thing on postBuild step"
```

</details>

### lifecycle.package

`package` - Package & optimize artifact


<details>
  <summary>Using package</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `package` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      package: () => {
        console.log("Do thing on package step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    package:
      - echo "Do thing on package step"
```

</details>

### lifecycle.preDeploy

`preDeploy` - Runs before built artifacts are deployed


<details>
  <summary>Using preDeploy</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `preDeploy` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      preDeploy: () => {
        console.log("Do thing on preDeploy step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    preDeploy:
      - echo "Do thing on preDeploy step"
```

</details>

### lifecycle.saveCache

`saveCache` - Save cached assets


<details>
  <summary>Using saveCache</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `saveCache` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      saveCache: () => {
        console.log("Do thing on saveCache step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    saveCache:
      - echo "Do thing on saveCache step"
```

</details>

### lifecycle.finally

`finally` - Runs after anything else


<details>
  <summary>Using finally</summary>

  <br/>

  **1. Using with a Plugin**

  Below is an example plugin using the `finally` hook

  ```js
  module.exports = function myPlugin(pluginConfig) {
    return {
      finally: () => {
        console.log("Do thing on finally step")
      }
    }
  }
  ```

  After creating the plugin, add into your Netlify config file under `plugins`

  ```yml
  plugins:
    myPlugin:
      type: ./path/to/plugin
      config:
        foo: bar
  ```


  **2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    finally:
      - echo "Do thing on finally step"
```

</details>
<!-- AUTO-GENERATED-CONTENT:END (PLUGINS) -->


## Configuration

Configuration can be written in `toml`, `yml`, `json`, or `json5`.

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

## Plugins

Netlify Plugins extend the functionality of the netlify build process.

Plugins are POJOs (plain old javascript objects) that allow users to hook into the different lifecycle steps happening during their site builds.

For example, hooking into the `preBuild` step to run something before your build command. Or the `postBuild` hook for running things after your site build has completed.


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
    }
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

### What can plugins do?

Plugins can do a-lot and we are excited what the JAMstack community will build!

**Here are some examples:**

- **netlify-plugin-lighthouse** to automatically track your lighthouse site score between deployments
- **netlify-plugin-cypress** to automatically run integration tests
- **netlify-plugin-tweet-new-post** to automatically share new content via twitter on new publish
- **netlify-plugin-sitemap** to generate sitemaps after build
- **netlify-plugin-notify** to automatically wired up build notifications
- **netlify-plugin-a11y-axe** to automatically audit site for accessibility issues
- **netlify-plugin-twiliosms** text your boss every time you deploy so they know you're working
- **netlify-plugin-svgoptimizer** to automatically optimize all SVGs in a directory when the site is built
- ... the sky is the limit 🌈

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

### Packages

This repo is setup as a monorepo.

Below are a list of packages included.

<!-- AUTO-GENERATED-CONTENT:START (PACKAGES) -->
- [@netlify/build](./packages/build) Netlify build module [npm link](https://www.npmjs.com/package/@netlify/build).
- [@netlify/config](./packages/config) Netlify config module [npm link](https://www.npmjs.com/package/@netlify/config).
- [@netlify/plugin-encrypted-files](./packages/netlify-plugin-encrypted-files)  [npm link](https://www.npmjs.com/package/@netlify/plugin-encrypted-files).
- [@netlify/plugin-no-more-404](./packages/netlify-plugin-no-more-404) fail netlify build if html goes missing with no redirects [npm link](https://www.npmjs.com/package/@netlify/plugin-no-more-404).
- [@netlify/plugin-sitemap](./packages/netlify-plugin-sitemap)  [npm link](https://www.npmjs.com/package/@netlify/plugin-sitemap).
- [netlify-build-plugin-svgoptimizer](./packages/netlify-plugin-svgoptimizer) Optimize SVG assets during the Netlify build process [npm link](https://www.npmjs.com/package/netlify-build-plugin-svgoptimizer).
<!-- AUTO-GENERATED-CONTENT:END (PACKAGES) -->
