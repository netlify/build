<img src="static/logo.png" width="400"/><br>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Netlify build is the next generation of CI/CD tooling for modern web applications.

[Sign up for the private beta](https://www.netlify.com/build/plugins-beta/)

[Demo video](https://www.youtube.com/watch?v=4m6Hi4_qEVE) and
[slides](https://docs.google.com/presentation/d/1zNcHHrJWnEp6Y-NDk9RE6g9GYCUjI-kdgYW28G2GkSA/edit?usp=sharing). See also
[example guide here in Creating and using your first Netlify Build Plugin](https://www.netlify.com/blog/2019/10/16/creating-and-using-your-first-netlify-build-plugin/).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Expand Table of Contents) -->
<details>
<summary>Expand Table of Contents</summary>

- [How it works](#how-it-works)
- [1. Extending via config](#1-extending-via-config)
- [2. Extending via plugins](#2-extending-via-plugins)
- [Lifecycle](#lifecycle)
- [lifecycle.onInit](#lifecycleoninit)
- [lifecycle.onGetCache](#lifecycleongetcache)
- [lifecycle.onInstall](#lifecycleoninstall)
- [lifecycle.onBuild](#lifecycleonbuild)
- [lifecycle.onFunctionsPackage](#lifecycleonfunctionspackage)
- [lifecycle.onPreDeploy](#lifecycleonpredeploy)
- [lifecycle.onSaveCache](#lifecycleonsavecache)
- [lifecycle.onSuccess](#lifecycleonsuccess)
- [lifecycle.onError](#lifecycleonerror)
- [lifecycle.onEnd](#lifecycleonend)
- [Configuration](#configuration)
- [Plugins](#plugins)
- [What can plugins do?](#what-can-plugins-do)
- [Community Plugins](#community-plugins)
- [CLI commands](#cli-commands)
- [Contributors](#contributors)

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

Historically, when connecting your site to Netlify, we ask for the build command (step 3 above) and will run through
this process. This works great for most use cases & will continue to do so 😃

For builds that require a little more flexibility, we are introducing a programatic interface on top of these build
events to allow users to customize this flow.

**Netlify Build** is designed to support any kind of build flow and is extendable to fit any unique project
requirements.

## How it works

Builds are controlled by a series of [lifecycle](#lifecycle) events that `plugins` and configuration hook into.

**The [build lifecycle](#lifecycle) can be extended in two ways:**

1. Adding lifecycle commands to `build.lifecycle` in your [config file](#extending-via-config)
2. Installing pre-packaged [plugins](#plugins)

### 1. Extending via config

Inside the netlify config file, you can attach [lifecycle](#lifecycle) commands to a new property `build.lifecycle`.

```yml
build:
  publish: my-dist-folder
  # Run this lifecycle during build
  lifecycle:
    onInit:
      - npm run thing
      - echo "much wow"
    onPreBuild: curl download-static-content
    onBuild: npm run build
    onPostBuild:
      - npx generate-sitemap
```

### 2. Extending via plugins

[Netlify Plugins](#plugins) are installable packages that extend the functionality of the netlify build process.

They can be installed from `npm` or run locally from relative path in your project.

```yml
# Config file `plugins` defines plugins used by build.
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
```

Netlify plugins can be found on npm by
[searching for `keywords:netlify-plugin`](https://www.npmjs.com/search?q=keywords%3Anetlify-plugin).

## Lifecycle

The build process runs through a series of lifecycle events. These events are the places we can extend how the Netlify
build operates.

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_TABLE) -->

| Event                                                                                       | Description                              |
| :------------------------------------------------------------------------------------------ | :--------------------------------------- |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleoninit">onInit</a>** ‏‏‎ ‏‏‎ ‏‏‎                         | Runs before anything else                |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleongetcache">onGetCache</a>** ‏‏‎ ‏‏‎ ‏‏‎                 | Fetch previous build cache               |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleoninstall">onInstall</a>** ‏‏‎ ‏‏‎ ‏‏‎                   | Install project dependencies             |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleonbuild">onBuild</a>** ‏‏‎ ‏‏‎ ‏‏‎                       | Build commands are executed              |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleonfunctionspackage">onFunctionsPackage</a>** ‏‏‎ ‏‏‎ ‏‏‎ | Package the serverless functions         |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleonpredeploy">onPreDeploy</a>** ‏‏‎ ‏‏‎ ‏‏‎               | Runs before built artifacts are deployed |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleonsavecache">onSaveCache</a>** ‏‏‎ ‏‏‎ ‏‏‎               | Save cached assets                       |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleonsuccess">onSuccess</a>** ‏‏‎ ‏‏‎ ‏‏‎                   | Runs on build success                    |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#lifecycleonerror">onError</a>** ‏‏‎ ‏‏‎ ‏‏‎                       | Runs on build error                      |
| 🎉 ‏‏‎ **<a href="#lifecycleonend">onEnd</a>** ‏‏‎ ‏‏‎ ‏‏‎                                  | Runs on build error or success           |

<!-- AUTO-GENERATED-CONTENT:END (LIFECYCLE_TABLE) -->

The Lifecycle flows the events in order and executes and their `onPre` & `onPost` counterparts.

`onPre` happens before a specific event.

`onPost` happens after a specific event.

```
      ┌───────────────┬────────────────┬──────────────────┐
      │     onPre     │     event      │      onPost      │
      ├───────────────┼────────────────┼──────────────────┤
      │               │                │                  │
      │               │                │                  │
...   │  onPreBuild   │    onBuild     │   onPostBuild    │   ...
      │               │                │                  │
      │               │                │                  │
      └───────────────┤                ├──────────────────┘
                      └────────────────┘

      ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ▶

                        event flow
```

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_DOCS) -->

### lifecycle.onInit

`onInit` - Runs before anything else

<details>
  <summary>Using onInit</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onInit` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onInit: () => {
      console.log('Do thing on onInit event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onInit:
      - echo "Do thing on onInit event"
```

</details>

### lifecycle.onGetCache

`onGetCache` - Fetch previous build cache

<details>
  <summary>Using onGetCache</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onGetCache` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onGetCache: () => {
      console.log('Do thing on onGetCache event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onGetCache:
      - echo "Do thing on onGetCache event"
```

</details>

### lifecycle.onInstall

`onInstall` - Install project dependencies

<details>
  <summary>Using onInstall</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onInstall` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onInstall: () => {
      console.log('Do thing on onInstall event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onInstall:
      - echo "Do thing on onInstall event"
```

</details>

### lifecycle.onBuild

`onBuild` - Build commands are executed

<details>
  <summary>Using onBuild</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onBuild` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onBuild: () => {
      console.log('Do thing on onBuild event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onBuild:
      - echo "Do thing on onBuild event"
```

</details>

### lifecycle.onFunctionsPackage

`onFunctionsPackage` - Package the serverless functions

<details>
  <summary>Using onFunctionsPackage</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onFunctionsPackage` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onFunctionsPackage: () => {
      console.log('Do thing on onFunctionsPackage event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onFunctionsPackage:
      - echo "Do thing on onFunctionsPackage event"
```

</details>

### lifecycle.onPreDeploy

`onPreDeploy` - Runs before built artifacts are deployed

<details>
  <summary>Using onPreDeploy</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onPreDeploy` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onPreDeploy: () => {
      console.log('Do thing on onPreDeploy event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onPreDeploy:
      - echo "Do thing on onPreDeploy event"
```

</details>

### lifecycle.onSaveCache

`onSaveCache` - Save cached assets

<details>
  <summary>Using onSaveCache</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onSaveCache` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onSaveCache: () => {
      console.log('Do thing on onSaveCache event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onSaveCache:
      - echo "Do thing on onSaveCache event"
```

</details>

### lifecycle.onSuccess

`onSuccess` - Runs on build success

<details>
  <summary>Using onSuccess</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onSuccess` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onSuccess: () => {
      console.log('Do thing on onSuccess event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onSuccess:
      - echo "Do thing on onSuccess event"
```

</details>

### lifecycle.onError

`onError` - Runs on build error

<details>
  <summary>Using onError</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onError` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onError: () => {
      console.log('Do thing on onError event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onError:
      - echo "Do thing on onError event"
```

</details>

### lifecycle.onEnd

`onEnd` - Runs on build error or success

<details>
  <summary>Using onEnd</summary>
  
  <br/>

**1. Using with a Plugin**

Below is an example plugin using the `onEnd` event handler

```js
module.exports = function myPlugin(pluginConfig) {
  return {
    onEnd: () => {
      console.log('Do thing on onEnd event')
    },
  }
}
```

After creating the plugin, add into your Netlify config file under `plugins`

```yml
plugins:
  - type: ./path/to/plugin
    config:
      foo: bar
```

**2. Using with via `build.lifecycle`**

```yml
build:
  lifecycle:
    onEnd:
      - echo "Do thing on onEnd event"
```

</details>
<!-- AUTO-GENERATED-CONTENT:END (PLUGINS) -->

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

# Inline `build.lifecycle` commands can be defined
build:
  lifecycle:
    onInit:
      - npm run foo
      - export VALUE=lol
      - echo "much wow"
    onGetCache:
      - echo 'curl custom cache'
    onPreBuild: echo "${env:privateKey}"
    onBuild: |
      echo 'Hello Netlify Build!'
      npm run build
```

Configuration now supports `environment` variables.

To reference an environment variable in Netlify config:

```yml
foo: ${env:MY_ENV_VAR}
```

## Plugins

Netlify Plugins extend the functionality of the netlify build process.

Plugins are plain JavaScript objects with event handlers for the different events happening during builds.

For example, the `onPreBuild` event handler runs before your build command. Or the `onPostBuild` event handler runs
after your site build has completed.

Here is an example:

```js
// ./node_modules/netlify-plugin-awesome/index.js

module.exports = {
  name: 'netlify-plugin-awesome',
  onInit: () => {
    console.log('Run custom logic at beginning of build')
  },
  onPreBuild: () => {
    console.log('Run custom logic before build happens')
  },
  onPostBuild: () => {
    console.log('Run custom logic after build happens')
  },
  onEnd: () => {
    console.log('Run custom logic at the end of the build')
  },
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
  # Path to plugin. Can be local relative path or reference to node_modules
  - type: netlify-plugin-awesome
    config:
      foo: hello
      bar: goodbye
```

### What can plugins do?

Plugins can do a-lot and we are excited what the JAMstack community will build!

**Here are some examples:**

- **@netlify/plugin-lighthouse** to automatically track your lighthouse site score between deployments
- **@netlify/plugin-sitemap** to generate sitemaps after build
- **@netlify/plugin-notify** to automatically wired up build notifications
- **@netlify/plugin-no-more-404** fail build or warn if prior .html files disappear without corresponding Netlify
  redirects.
- **@netlify/plugin-axe** to automatically audit site for accessibility issues
- **@netlify/plugin-encrypted-files** to encrypt files in source, but to decrypt them locally and for the build, so that
  you can do _partial_ open source sites without leaking announcements or private info.
- **@netlify/plugin-twiliosms** text your boss every time you deploy so they know you're working -
  [example guide here in Creating and using your first Netlify Build Plugin](https://www.netlify.com/blog/2019/10/16/creating-and-using-your-first-netlify-build-plugin/)
- **@netlify/plugin-svgoptimizer** to automatically optimize all SVGs in a directory when the site is built
- **netlify-plugin-cypress** to automatically run integration tests
- **netlify-plugin-tweet-new-post** to automatically share new content via twitter on new publish
- ... the sky is the limit 🌈

## Community Plugins

To add a plugin, add informations to the
[plugins.json file]('https://github.com/netlify/plugins/blob/master/plugins.json').

<!-- AUTO-GENERATED-CONTENT:START (COMMUNITY_PLUGINS) -->

| Plugin                                                                                                                                                                                                                                                                                                         |                       Author                        |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------: |
| **[Build Plugin Speedcurve - `netlify-build-plugin-speedcurve`](https://github.com/tkadlec/netlify-build-plugin-speedcurve)** <br/> After a successful build, tell SpeedCurve you've deployed and trigger a round of testing                                                                                   |        [tkadlec](https://github.com/tkadlec)        |
| **[Checklinks - `netlify-plugin-checklinks`](https://github.com/munter/netlify-plugin-checklinks)** <br/> Checklinks helps you keep all your asset references correct and avoid embarrassing broken links to your internal pages, or even to external pages you link out to.                                   |         [munter](https://github.com/munter)         |
| **[Deployment Hours - `netlify-deployment-hours-plugin`](https://github.com/neverendingqs/netlify-deployment-hours-plugin)** <br/> A Netlify build plugin that blocks deployment if it outside of deployment hours.                                                                                            |  [neverendingqs](https://github.com/neverendingqs)  |
| **[Fetch Feeds - `netlify-plugin-fetch-feeds`](https://github.com/philhawksworth/netlify-plugin-fetch-feeds)** <br/> A Netlify plugin to source content from remote feeds including RSS and JSON                                                                                                               | [philhawksworth](https://github.com/philhawksworth) |
| **[Gatsby Cache - `netlify-plugin-gatsby-cache`](https://github.com/jlengstorf/netlify-plugin-gatsby-cache#readme)** <br/> Persist the Gatsby cache between Netlify builds for huge build speed improvements! ⚡️                                                                                              |     [jlengstorf](https://github.com/jlengstorf)     |
| **[Hashfiles - `netlify-plugin-hashfiles`](https://github.com/munter/netlify-plugin-hashfiles)** <br/> Hashfiles sets you up with an optimal caching strategy for static sites, where static assets across pages are cached for as long as possible in the visitors browser and never have to be re-requested. |         [munter](https://github.com/munter)         |
| **[Image Optim - `netlify-plugin-image-optim`](https://github.com/chrisdwheatley/netlify-plugin-image-optim)** <br/> Optimize images as part of your Netlify build process. Optimizes PNG, JPEG, GIF and SVG file formats.                                                                                     | [chrisdwheatley](https://github.com/chrisdwheatley) |
| **[Sitemap - `netlify-plugin-sitemap`](https://github.com/netlify-labs/netlify-plugin-sitemap)** <br/> Automatically generate sitemaps on build                                                                                                                                                                |   [netlify-labs](https://github.com/netlify-labs)   |
| **[Subfont - `netlify-plugin-subfont`](https://github.com/munter/netlify-plugin-subfont)** <br/> Subfont post-processes your web page to analyse you usage of web fonts, then reworks your webpage to use an optimal font loading strategy for the best performance.                                           |         [munter](https://github.com/munter)         |
| **[Yield Data For Eleventy - `netlify-plugin-yield-data-for-eleventy`](https://github.com/philhawksworth/netlify-plugin-yield-data-for-eleventy)** <br/> A Netlify plugin to expose data collected to in the Netlify build cache to place and structure that Eleventy can use                                  | [philhawksworth](https://github.com/philhawksworth) |

<!-- AUTO-GENERATED-CONTENT:END (COMMUNITY_PLUGINS) -->

## CLI commands

Like [Netlify dev](https://www.netlify.com/products/dev/), Netlify build runs locally and in the remote CI context

To execute your build locally, run the following CLI command:

```
netlify build
```

It's also possible to "try before you buy" and test out the build flow before executing any code with the `dry` run
flag.

The `--dry` flag will output everything that happens in the build flow without executing the plugin event handlers.

To execute a test run of the build locally, run the following CLI command:

```
netlify build --dry
```

## Contributors

Thanks for contributing!

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repo itself.
