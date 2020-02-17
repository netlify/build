# Netlify Build

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Netlify build is the next generation of CI/CD tooling for modern web applications.

[Sign up for the private beta](https://www.netlify.com/build/plugins-beta/)

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Expand Table of Contents) -->
<details>
<summary>Expand Table of Contents</summary>

- [Background](#background)
- [How it works](#how-it-works)
  - [1. Extending via config](#1-extending-via-config)
  - [2. Extending via plugins](#2-extending-via-plugins)
- [Build Lifecycle](#build-lifecycle)
  - [`onInit`](#oninit)
  - [`onPreBuild`](#onprebuild)
  - [`onBuild`](#onbuild)
  - [`onPostBuild`](#onpostbuild)
  - [`onSuccess`](#onsuccess)
  - [`onError`](#onerror)
  - [`onEnd`](#onend)
- [Netlify Configuration](#netlify-configuration)
- [Plugins](#plugins)
- [What can plugins do?](#what-can-plugins-do)
  - [1. Optimizing build speeds & lowing cost](#1-optimizing-build-speeds--lowing-cost)
  - [2. Standardize workflows & developer productivity](#2-standardize-workflows--developer-productivity)
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
this build process. This works great for most use cases & will continue to do so 😃

For builds that require a little more flexibility, we are introducing **Netlify Build** as programatic interface on top
of these build events to allow users to customize this flow.

<img src="static/logo.png" width="400" />

**Netlify Build** is designed to support any kind of build flow and is extendable to fit any unique project
requirements.

## How it works

Builds are controlled by a series of [lifecycle](#lifecycle) events that `plugins` and Netlify config files can hook
into.

**The [build lifecycle](#lifecycle) can be extended in two ways:**

1. Adding lifecycle commands to `build.lifecycle` in your [config file](#extending-via-config)
2. Installing pre-packaged [plugins](#plugins)

Let's examine each.

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
  - package: ./local/path/to/plugin-folder
    config:
      optionOne: 'hello'
      optionTwo: 'there'
 - package: plugin-from-npm
   config:
     optionOne: 'neat'
     arrayOfValues:
      - david@netlify.com
      - jim@netlify.com
```

Netlify plugins can be found on npm by
[searching for `keywords:netlify-plugin`](https://www.npmjs.com/search?q=keywords%3Anetlify-plugin) or in the
[plugin directory](https://github.com/netlify/plugins#community-plugins).

## Build Lifecycle

The build process runs through a series of lifecycle events. These events are the places we can extend how the Netlify
build operates.

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_TABLE) -->

| Event                                                                | Description                        |
| :------------------------------------------------------------------- | :--------------------------------- |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#oninit">onInit</a>** ‏‏‎ ‏‏‎ ‏‏‎           | Runs before anything else          |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#onprebuild">onPreBuild</a>** ‏‏‎ ‏‏‎ ‏‏‎   | Before build commands are executed |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#onbuild">onBuild</a>** ‏‏‎ ‏‏‎ ‏‏‎         | Build commands are executed        |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#onpostbuild">onPostBuild</a>** ‏‏‎ ‏‏‎ ‏‏‎ | After Build commands are executed  |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#onsuccess">onSuccess</a>** ‏‏‎ ‏‏‎ ‏‏‎     | Runs on build success              |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **<a href="#onerror">onError</a>** ‏‏‎ ‏‏‎ ‏‏‎         | Runs on build error                |
| 🎉 ‏‏‎ **<a href="#onend">onEnd</a>** ‏‏‎ ‏‏‎ ‏‏‎                    | Runs on build error or success     |

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

### `onInit`

Runs before anything else

<details>
  <summary>Using <strong>onInit</strong> in a plugin</summary>
  
  <br/>

Below is an example plugin using the `onInit` event handler

```js
// File my-plugin.js
module.exports = function myPlugin(conf) {
  return {
    onInit: ({ pluginConfig, netlifyConfig, constants, utils }) => {
      console.log('Run custom logic during onInit event')
    },
  }
}
```

After creating the plugin, add into your [Netlify config](#netlify-configuration) file under the `plugins` section.

Plugins can be referenced locally or installed via NPM.

`netlify.yml` example:

```yml
plugins:
  - package: ./path/to/my-plugin.js
```

</details>

<details>
  <summary>Using <strong>onInit</strong> via Netlify config</summary>
  
  <br/>

Below is an example of how to use the `onInit` event in the Netlify config file.

```yml
build:
  lifecycle:
    onInit:
      - echo "Do thing on onInit event"
```

</details>

### `onPreBuild`

Before build commands are executed

<details>
  <summary>Using <strong>onPreBuild</strong> in a plugin</summary>
  
  <br/>

Below is an example plugin using the `onPreBuild` event handler

```js
// File my-plugin.js
module.exports = function myPlugin(conf) {
  return {
    onPreBuild: ({ pluginConfig, netlifyConfig, constants, utils }) => {
      console.log('Run custom logic during onPreBuild event')
    },
  }
}
```

After creating the plugin, add into your [Netlify config](#netlify-configuration) file under the `plugins` section.

Plugins can be referenced locally or installed via NPM.

`netlify.yml` example:

```yml
plugins:
  - package: ./path/to/my-plugin.js
```

</details>

<details>
  <summary>Using <strong>onPreBuild</strong> via Netlify config</summary>
  
  <br/>

Below is an example of how to use the `onPreBuild` event in the Netlify config file.

```yml
build:
  lifecycle:
    onPreBuild:
      - echo "Do thing on onPreBuild event"
```

</details>

### `onBuild`

Build commands are executed

<details>
  <summary>Using <strong>onBuild</strong> in a plugin</summary>
  
  <br/>

Below is an example plugin using the `onBuild` event handler

```js
// File my-plugin.js
module.exports = function myPlugin(conf) {
  return {
    onBuild: ({ pluginConfig, netlifyConfig, constants, utils }) => {
      console.log('Run custom logic during onBuild event')
    },
  }
}
```

After creating the plugin, add into your [Netlify config](#netlify-configuration) file under the `plugins` section.

Plugins can be referenced locally or installed via NPM.

`netlify.yml` example:

```yml
plugins:
  - package: ./path/to/my-plugin.js
```

</details>

<details>
  <summary>Using <strong>onBuild</strong> via Netlify config</summary>
  
  <br/>

Below is an example of how to use the `onBuild` event in the Netlify config file.

```yml
build:
  lifecycle:
    onBuild:
      - echo "Do thing on onBuild event"
```

</details>

### `onPostBuild`

After Build commands are executed

<details>
  <summary>Using <strong>onPostBuild</strong> in a plugin</summary>
  
  <br/>

Below is an example plugin using the `onPostBuild` event handler

```js
// File my-plugin.js
module.exports = function myPlugin(conf) {
  return {
    onPostBuild: ({ pluginConfig, netlifyConfig, constants, utils }) => {
      console.log('Run custom logic during onPostBuild event')
    },
  }
}
```

After creating the plugin, add into your [Netlify config](#netlify-configuration) file under the `plugins` section.

Plugins can be referenced locally or installed via NPM.

`netlify.yml` example:

```yml
plugins:
  - package: ./path/to/my-plugin.js
```

</details>

<details>
  <summary>Using <strong>onPostBuild</strong> via Netlify config</summary>
  
  <br/>

Below is an example of how to use the `onPostBuild` event in the Netlify config file.

```yml
build:
  lifecycle:
    onPostBuild:
      - echo "Do thing on onPostBuild event"
```

</details>

### `onSuccess`

Runs on build success

<details>
  <summary>Using <strong>onSuccess</strong> in a plugin</summary>
  
  <br/>

Below is an example plugin using the `onSuccess` event handler

```js
// File my-plugin.js
module.exports = function myPlugin(conf) {
  return {
    onSuccess: ({ pluginConfig, netlifyConfig, constants, utils }) => {
      console.log('Run custom logic during onSuccess event')
    },
  }
}
```

After creating the plugin, add into your [Netlify config](#netlify-configuration) file under the `plugins` section.

Plugins can be referenced locally or installed via NPM.

`netlify.yml` example:

```yml
plugins:
  - package: ./path/to/my-plugin.js
```

</details>

<details>
  <summary>Using <strong>onSuccess</strong> via Netlify config</summary>
  
  <br/>

Below is an example of how to use the `onSuccess` event in the Netlify config file.

```yml
build:
  lifecycle:
    onSuccess:
      - echo "Do thing on onSuccess event"
```

</details>

### `onError`

Runs on build error

<details>
  <summary>Using <strong>onError</strong> in a plugin</summary>
  
  <br/>

Below is an example plugin using the `onError` event handler

```js
// File my-plugin.js
module.exports = function myPlugin(conf) {
  return {
    onError: ({ pluginConfig, netlifyConfig, constants, utils }) => {
      console.log('Run custom logic during onError event')
    },
  }
}
```

After creating the plugin, add into your [Netlify config](#netlify-configuration) file under the `plugins` section.

Plugins can be referenced locally or installed via NPM.

`netlify.yml` example:

```yml
plugins:
  - package: ./path/to/my-plugin.js
```

</details>

<details>
  <summary>Using <strong>onError</strong> via Netlify config</summary>
  
  <br/>

Below is an example of how to use the `onError` event in the Netlify config file.

```yml
build:
  lifecycle:
    onError:
      - echo "Do thing on onError event"
```

</details>

### `onEnd`

Runs on build error or success

<details>
  <summary>Using <strong>onEnd</strong> in a plugin</summary>
  
  <br/>

Below is an example plugin using the `onEnd` event handler

```js
// File my-plugin.js
module.exports = function myPlugin(conf) {
  return {
    onEnd: ({ pluginConfig, netlifyConfig, constants, utils }) => {
      console.log('Run custom logic during onEnd event')
    },
  }
}
```

After creating the plugin, add into your [Netlify config](#netlify-configuration) file under the `plugins` section.

Plugins can be referenced locally or installed via NPM.

`netlify.yml` example:

```yml
plugins:
  - package: ./path/to/my-plugin.js
```

</details>

<details>
  <summary>Using <strong>onEnd</strong> via Netlify config</summary>
  
  <br/>

Below is an example of how to use the `onEnd` event in the Netlify config file.

```yml
build:
  lifecycle:
    onEnd:
      - echo "Do thing on onEnd event"
```

</details>
<!-- AUTO-GENERATED-CONTENT:END (PLUGINS) -->

## Netlify Configuration

Below you will see 2 new values for Netlify configuration. `build.lifecycle` & `plugins`.

`build.lifecycle` is where you can define inline commands to run during the different stages of the build lifecycle.

`plugins` is an array of build plugins to run during the build process. These run in the order in which they are
defined.

**Example:**

```yml
# Inline `build.lifecycle` commands can be defined
build:
  functions: src/functions
  publish: build
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

# Config file `plugins` defines plugins used by build. Plugins are optional
plugins:
  - package: ./local/path/to/plugin-folder
    config:
      optionOne: hello
      optionTwo: there
  - package: plugin-from-npm
    config:
      optionOne: neat
      arrayOfValues:
        - david@netlify.com
        - jim@netlify.com
```

Configuration now supports `environment` variables.

To reference an environment variable in Netlify config:

```yml
foo: ${env:MY_ENV_VAR}
```

Configuration also supports fallback values:

```yml
foo: ${env:MY_ENV_VAR, 'default-value'}
```

Configuration can be written in `toml`, `yml`, `json`, or `json5`.

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
  - package: netlify-plugin-awesome
    config:
      foo: hello
      bar: goodbye
```

Read the docs for
[more information on building plugins](https://github.com/netlify/build/blob/master/docs/creating-a-plugin.md)

The above example shows show to use `netlify.yml` with YAML syntax. It's also possible to keep using `toml`. Adding a
plugin in TOML looks like:

```toml
[[plugins]]
package = "./path/to/my-plugin.js"
```

## What can plugins do?

Plugins can do **a-lot** and we are excited what the JAMstack community will build!

Below are some areas where build plugins can help expands what is possible in site builds.

### 1. Optimizing build speeds & lowing cost

Using a smart build plugin, you can avoid & optimize expensive time consuming build processes.

This will help users avoid things like optimizing the same images every build, running builds when irrelevant
`README.md` files have changed, building site files when only serverless functions have changed etc.

By leveraging the [git](https://github.com/netlify/build/blob/master/packages/git-utils/README.md) and
[caching](https://github.com/netlify/build/blob/master/packages/cache-utils/README.md) utilities provided many things
are possible!

<details>
  <summary>Some plugin examples</summary>

  <br/>

Below is a list of things possible with Build plugins to get some ideas flowing

- **Gatsby cache plugin**
- **Cypress Route testing plugin** - Only running cypress tests on routes that have changed
- **Ignore site build scripts plugin** - Only run site build commands if site files have changed. Otherwise just build
  serverless functions.
- **Smart builds plugin** - Ignore site build if source files we change about, e.g. markdown/src directory's haven't
  changed
- **Check external content updates plugin** - Only build if external content from third party CMS has changed
- Optimize only new images **not** found in the previous build's cache folder
- Only build relevant sub directories that have changed & restore the rest of the site from previous build cache.
  Incremental builds?!?!?!
- Aggressively cache dependancies/generated files/etc for faster boot up times
- NoOp component library/Storybook builds if component src files haven't changed.
- Automatically disable builds during specific times of day.
- ... etc. Maybe options! 🤩

</details>

### 2. Standardize workflows & developer productivity

In today's age of JavaScript fatigue, setting up new projects & build tools is no easy feat. The amount of complexity
that comes with setting up a production build environment is non trivial & typically replicated over and over again for
projects.

Build plugins are designed to help streamline this flow & help growing teams move faster.

By abstracting common build tasks **up the stack**, this allows for plugins to be re-used in any type of project
regardless of the underlying framework or static site generator.

Plugins are meant to be shared within teams & in the broader JAMStack ecosystem. This enables developers & teams to
focus more time on building their app and less time on setting up the plumbing of a CI pipeline.

Some additional benefits we think will materialize out of standardizing these flows include:

- Improved security practices
- Increased compliance & accessibility
- Enforcing performance budgets
- Less time on-boarding new developers to the team
- Lower project maintenance
- Easier project scaffolding
- & ultimately shipping more awesome

<details>
  <summary>Some workflow plugin examples</summary>

  <br/>

Below is a list of things possible with Build plugins to get some ideas flowing

- **Company XYZ creates a plugin that encompasses performance, accessibility & security requirements for all their web
  properties**. This plugin uses various performance + accessibility regression testing tools and scans dependancies for
  critical vulnerabilities. This plugin also sends back build metrics to a centralized logging tool for further BI
  processing. This plugin is installed as a one liner in all Netlify projects.
- **A component tracking plugin** - This plugin scans the src code for components used from a component library & tracks
  which products are using which components, their versions, & other meta data. This helps inform the component library
  team what teams they need to coordinate with to safely test & release changes across the organization.
- **Analytics assurance plugin** - This plugin scans built output and verifies that every page on the site includes
  their google analytics tracking code & that the code is not malformed.
- **"SEO audit" plugin.** - This plugin scans built site to ensure all pages have required meta tags, properly formatted
  schema tags & social open graph tags. It also verifies the validity of the sitemap and submits the new sitemap to
  google webmaster tools when a new page is added to ensure a hasty indexation time.
- **404 no more plugin.** - This plugin guards against pages being removed & not having a proper redirect setup.
- **Lighthouse performance** - testing to guard against performance degradation.
- **Text linting plugins** This plugin would scan the built output of the site for common misspellings & brand keywords
  that need to be consistent across the product & cancel build or report these.
- **Saucelabs cross browser testing plugin** Automatically run deploy previews their every known browser to verify your
  app works across all browsers you support
- **"Self healing" deploy plugins.** - These plugins would detect a regression in a postDeployment hook and
  automatically report the issue & rollback the regression to a previous verified deployment.
- **"Canary deployments" plugin** - These plugins can use the A/B routing tool to gradually route traffic to the newly
  deployed version while "retiring" the previously deployed app if no error threshold is passed
- **Accessibility plugins** - to automatically audit site for accessibility issues
- **Image & asset optimization plugins** to automatically optimize site assets in a directory when the site is built to
  ensure optimal performance.
- **CSP (Content security policy) audit plugin** - This plugin checks the content security policy of the site & warns +
  enforces a secure policy to prevent cross script scripting attacks
- **Third party script + GDPR auditor plugin"** - This plugin scans the site for any third party script tags included,
  loads the page & reports the find output of scripts loaded on the page, the cookies/storage they produce & report +
  track them for the user. These values are increasingly important with GPDR & cookie consent laws.
- **Dependency scanner plugin** - A dependency scanner plugin to ensure no compromised dependencies are present.
- **Ingress/Egress Rules plugin** This plugin ensures that any http calls during the build process are to approved
  endpoints & not to malicious third party leaking secrets etc.
- **XSS payload injection plugin** This plugin runs post deployment & hammers form inputs with common XSS payloads to
  verify inputs & requests are properly sanitized.
- ... the sky is the limit 🌈

</details>

## Community Plugins

There is a plugins directory of community created plugins over at https://github.com/netlify/plugins.

We are excited to see what the community will come up with next.

<!-- AUTO-GENERATED-CONTENT:START (COMMUNITY_PLUGINS) -->

| Plugin                                                                                                                                                                                                                                                                                                         |                       Author                        |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------: |
| **[@Netlify/plugin Sitemap - `@netlify/plugin-sitemap`](https://github.com/netlify-labs/netlify-plugin-sitemap)** <br/> Automatically generate a sitemap for your site on PostBuild in Netlify                                                                                                                 |   [netlify-labs](https://github.com/netlify-labs)   |
| **[Build Plugin Speedcurve - `netlify-build-plugin-speedcurve`](https://github.com/tkadlec/netlify-build-plugin-speedcurve)** <br/> After a successful build, tell SpeedCurve you've deployed and trigger a round of testing                                                                                   |        [tkadlec](https://github.com/tkadlec)        |
| **[Cache Nextjs - `netlify-plugin-cache-nextjs`](https://github.com/pizzafox/netlify-cache-nextjs#readme)** <br/> Cache the .next folder in Netlify builds                                                                                                                                                     |       [pizzafox](https://github.com/pizzafox)       |
| **[Checklinks - `netlify-plugin-checklinks`](https://github.com/munter/netlify-plugin-checklinks)** <br/> Checklinks helps you keep all your asset references correct and avoid embarrassing broken links to your internal pages, or even to external pages you link out to.                                   |         [munter](https://github.com/munter)         |
| **[Debug Cache - `netlify-plugin-debug-cache`](https://github.com/netlify-labs/netlify-plugin-debug-cache)** <br/> Debug & verify the contents of your Netlify build cache                                                                                                                                     |   [netlify-labs](https://github.com/netlify-labs)   |
| **[Deployment Hours - `netlify-deployment-hours-plugin`](https://github.com/neverendingqs/netlify-deployment-hours-plugin)** <br/> A Netlify build plugin that blocks deployment if it outside of deployment hours.                                                                                            |  [neverendingqs](https://github.com/neverendingqs)  |
| **[Fetch Feeds - `netlify-plugin-fetch-feeds`](https://github.com/philhawksworth/netlify-plugin-fetch-feeds)** <br/> A Netlify plugin to source content from remote feeds including RSS and JSON                                                                                                               | [philhawksworth](https://github.com/philhawksworth) |
| **[Gatsby Cache - `netlify-plugin-gatsby-cache`](https://github.com/jlengstorf/netlify-plugin-gatsby-cache#readme)** <br/> Persist the Gatsby cache between Netlify builds for huge build speed improvements! ⚡️                                                                                              |     [jlengstorf](https://github.com/jlengstorf)     |
| **[Ghost Markdown - `netlify-plugin-ghost-markdown`](https://github.com/daviddarnes/netlify-plugin-ghost-markdown)** <br/> Generates posts and pages from a Ghost publication as markdown files, using the Ghost Content API.                                                                                  |    [daviddarnes](https://github.com/daviddarnes)    |
| **[Hashfiles - `netlify-plugin-hashfiles`](https://github.com/munter/netlify-plugin-hashfiles)** <br/> Hashfiles sets you up with an optimal caching strategy for static sites, where static assets across pages are cached for as long as possible in the visitors browser and never have to be re-requested. |         [munter](https://github.com/munter)         |
| **[Image Optim - `netlify-plugin-image-optim`](https://github.com/chrisdwheatley/netlify-plugin-image-optim)** <br/> Optimize images as part of your Netlify build process. Optimizes PNG, JPEG, GIF and SVG file formats.                                                                                     | [chrisdwheatley](https://github.com/chrisdwheatley) |
| **[Subfont - `netlify-plugin-subfont`](https://github.com/munter/netlify-plugin-subfont)** <br/> Subfont post-processes your web page to analyse you usage of web fonts, then reworks your webpage to use an optimal font loading strategy for the best performance.                                           |         [munter](https://github.com/munter)         |
| **[Yield Data For Eleventy - `netlify-plugin-yield-data-for-eleventy`](https://github.com/philhawksworth/netlify-plugin-yield-data-for-eleventy)** <br/> A Netlify plugin to expose data collected to in the Netlify build cache to place and structure that Eleventy can use                                  | [philhawksworth](https://github.com/philhawksworth) |

<!-- AUTO-GENERATED-CONTENT:END (COMMUNITY_PLUGINS) -->

To add a plugin, add information to the
[plugins.json file]('https://github.com/netlify/plugins/blob/master/plugins.json').

## CLI commands

Like [Netlify dev](https://www.netlify.com/products/dev/), Netlify build runs locally and in the remote CI context

Install the [Netlify CLI](https://github.com/netlify/cli), if you haven't already.

```
npm install netlify-cli -g
```

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
