<img src="static/logo.png" width="400" />

<br/>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

# Netlify Build

Netlify build is the next generation of CI/CD tooling for modern web applications.

[Sign up for the private beta](https://www.netlify.com/build/plugins-beta/)

<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Expand Table of Contents) -->
<details>
<summary>Expand Table of Contents</summary>

- [Background](#background)
- [Netlify Configuration](#netlify-configuration)
- [Plugins internals](#plugins-internals)
- [What can plugins do?](#what-can-plugins-do)
  - [1. Optimizing build speeds & lowing cost](#1-optimizing-build-speeds--lowing-cost)
  - [2. Standardize workflows & developer productivity](#2-standardize-workflows--developer-productivity)
- [Community Plugins](#community-plugins)
- [CLI commands](#cli-commands)
- [Contributors](#contributors)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->

## Background

Netlify Build Plugins extend the functionality of the Netlify Build process.

Plugins are designed to support any kind of build flow and is extendable to fit any unique project requirements.

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
