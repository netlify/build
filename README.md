# Netlify Build

Netlify build is the next generation of CI/CD tooling for modern web applications.

It is designed to support any kind of build flow and is extendable to fit any unique project requirements.

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Expand Table of Contents) -->
<details>
<summary>Expand Table of Contents</summary>

- [How it works](#how-it-works)
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
- [CLI commands](#cli-commands)
- [Setting up the project](#setting-up-the-project)
- [XYZ](#xyz)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## How it works

Build steps are codified in the Netlify UI or via `netlify` config file in the `build.lifecycle` or as `plugins`.

Builds are controlled by a series of lifecycle events that `plugins` & configuration (`build.lifecycle`) hook into.

## Lifecycle

The Netlify build lifecycle consists of these lifecycle `events`.

Events are activities that happen while during the course of the build system running.

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_TABLE) -->
| Event | Description |
|:------|:-------|
| ⇩ ‏‏‎ **<a href="#lifecycleinit">init</a>** | Runs before anything else |
| ⇩ ‏‏‎ **<a href="#lifecyclegetcache">getCache</a>** | Fetch previous build cache |
| ⇩ ‏‏‎ **<a href="#lifecycleinstall">install</a>** | Install project dependancies |
| ⇩ ‏‏‎ **<a href="#lifecycleprebuild">preBuild</a>** | runs before functions & build commands run |
| ⇩ ‏‏‎ **<a href="#lifecyclefunctionsbuild">functionsBuild</a>** | build the serverless functions |
| ⇩ ‏‏‎ **<a href="#lifecyclebuild">build</a>** | build commands run |
| ⇩ ‏‏‎ **<a href="#lifecyclepostbuild">postBuild</a>** | Runs after site & functions have been built |
| ⇩ ‏‏‎ **<a href="#lifecyclepackage">package</a>** | Package & optimize artifact |
| ⇩ ‏‏‎ **<a href="#lifecyclepredeploy">preDeploy</a>** | Deploy built artifact |
| ⇩ ‏‏‎ **<a href="#lifecyclesavecache">saveCache</a>** | Save cached assets |
| 🎉 ‏‏‎ **<a href="#lifecyclefinally">finally</a>** | Runs after anything else |
<!-- AUTO-GENERATED-CONTENT:END (LIFECYCLE_TABLE) -->

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_DOCS) -->
### lifecycle.init

`init` - Runs before anything else


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    init: () => {
      console.log("Do thing on init step")
    }
  }
}
```

```yml
build:
  lifecycle:
    init:
      - echo "Do thing on init step"
```

### lifecycle.getCache

`getCache` - Fetch previous build cache


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    getCache: () => {
      console.log("Do thing on getCache step")
    }
  }
}
```

```yml
build:
  lifecycle:
    getCache:
      - echo "Do thing on getCache step"
```

### lifecycle.install

`install` - Install project dependancies


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    install: () => {
      console.log("Do thing on install step")
    }
  }
}
```

```yml
build:
  lifecycle:
    install:
      - echo "Do thing on install step"
```

### lifecycle.preBuild

`preBuild` - runs before functions & build commands run


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    preBuild: () => {
      console.log("Do thing on preBuild step")
    }
  }
}
```

```yml
build:
  lifecycle:
    preBuild:
      - echo "Do thing on preBuild step"
```

### lifecycle.functionsBuild

`functionsBuild` - build the serverless functions


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    functionsBuild: () => {
      console.log("Do thing on functionsBuild step")
    }
  }
}
```

```yml
build:
  lifecycle:
    functionsBuild:
      - echo "Do thing on functionsBuild step"
```

### lifecycle.build

`build` - build commands run


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    build: () => {
      console.log("Do thing on build step")
    }
  }
}
```

```yml
build:
  lifecycle:
    build:
      - echo "Do thing on build step"
```

### lifecycle.postBuild

`postBuild` - Runs after site & functions have been built


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    postBuild: () => {
      console.log("Do thing on postBuild step")
    }
  }
}
```

```yml
build:
  lifecycle:
    postBuild:
      - echo "Do thing on postBuild step"
```

### lifecycle.package

`package` - Package & optimize artifact


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    package: () => {
      console.log("Do thing on package step")
    }
  }
}
```

```yml
build:
  lifecycle:
    package:
      - echo "Do thing on package step"
```

### lifecycle.preDeploy

`preDeploy` - Deploy built artifact


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    preDeploy: () => {
      console.log("Do thing on preDeploy step")
    }
  }
}
```

```yml
build:
  lifecycle:
    preDeploy:
      - echo "Do thing on preDeploy step"
```

### lifecycle.saveCache

`saveCache` - Save cached assets


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    saveCache: () => {
      console.log("Do thing on saveCache step")
    }
  }
}
```

```yml
build:
  lifecycle:
    saveCache:
      - echo "Do thing on saveCache step"
```

### lifecycle.finally

`finally` - Runs after anything else


```js
module.exports = function myPlugin(pluginConfig) {
  return {
    finally: () => {
      console.log("Do thing on finally step")
    }
  }
}
```

```yml
build:
  lifecycle:
    finally:
      - echo "Do thing on finally step"
```
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
