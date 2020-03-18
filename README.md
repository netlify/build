# Netlify Build

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)


Netlify Build is a new, pluggable tool for running builds locally and in Netlify CI. It introduces Build Plugins, which are **now in public beta.** Learn how to enable your site to use Netlify Build and Build Plugins in the [Netlify docs](https://docs.netlify.com/configure-builds/plugins).

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Expand Table of Contents) -->
<details>
<summary>Expand Table of Contents</summary>

- [What are Build Plugins?](#what-are-build-plugins)
- [Netlify Configuration](#netlify-configuration)
- [Plugins internals](#plugins-internals)
- [What can plugins do?](#what-can-plugins-do)
  * [1. Optimizing build speeds & lowing cost](#1-optimizing-build-speeds--lowing-cost)
  * [2. Standardize workflows & developer productivity](#2-standardize-workflows--developer-productivity)
- [Community Plugins](#community-plugins)
- [CLI commands](#cli-commands)
- [Contributors](#contributors)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## What are Build Plugins?

Netlify Build Plugins extend the functionality of the Netlify Build process. You can install plugins made by others, or write your own. You can save them locally in your repository, or share them with others via npm.

For more information on installing, managing, and running Build Plugins on your Netlify site, visit the [Netlify docs](https://docs.netlify.com/configure-builds/plugins).

The content in this repository focuses on how to build your own plugins.

## What can plugins do?

Quite a lot! Community members have already created [several plugins](https://github.com/netlify/plugins#community-plugins) to perform a variety of tasks during the build, including:

- controlling how files are cached between builds
- checking for broken links in a site after building
- importing and converting data from external sources
- analyzing and optimizing site asset handling for better runtime performance
- generating content like sitemaps, RSS feeds, and search indexes


## Netlify Configuration

`plugins` is a new Netlify configuration property. It is an array of build plugins to run during the build process.
These run in the order in which they are defined.

**Example:**

```yml
build:
  functions: src/functions
  publish: build
  command: npm run build

# Config file `plugins` defines plugins used by build. Plugins are optional
plugins:
  - package: ./local/path/to/plugin-folder
    inputs:
      optionOne: hello
      optionTwo: there
  - package: plugin-from-npm
    inputs:
      optionOne: neat
      arrayOfValues:
        - david@netlify.com
        - jim@netlify.com
```

Plugins can be installed from `npm` or run locally from relative path in your project. They can be found on npm by
[searching for `keywords:netlify-plugin`](https://www.npmjs.com/search?q=keywords%3Anetlify-plugin) or in the
[plugin directory](https://github.com/netlify/plugins#community-plugins).

## Plugins internals

Plugins are plain JavaScript objects with event handlers for the different events happening during builds.

Read the docs for
[more information on building plugins](https://github.com/netlify/build/blob/master/docs/creating-a-plugin.md)


## Community Plugins

There is a plugins directory of community created plugins over at https://github.com/netlify/plugins.

We are excited to see what the community will come up with next.

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
