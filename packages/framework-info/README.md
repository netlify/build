[![npm version](https://img.shields.io/npm/v/@netlify/framework-info.svg)](https://npmjs.org/package/@netlify/framework-info)
[![Coverage Status](https://codecov.io/gh/netlify/framework-info/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/framework-info)
[![Build](https://github.com/netlify/framework-info/workflows/Build/badge.svg)](https://github.com/netlify/framework-info/actions)
[![Downloads](https://img.shields.io/npm/dm/@netlify/framework-info.svg)](https://www.npmjs.com/package/@netlify/framework-info)

Framework detection utility.

Detects which framework a specific website is using. The framework's build/watch commands, publish directory and server
port are also returned.

The following frameworks are detected:

- Static site generators: Gatsby, Hugo, Jekyll, Next.js, Nuxt, Hexo, Gridsome, Docusaurus, Eleventy, Middleman,
  Phenomic, React-static, Stencil, Vuepress
- Front-end frameworks: create-react-app, Vue, Sapper, Angular, Ember, Svelte, Expo, Quasar
- Build tools: Parcel, Brunch

[Additions and updates are welcome!](#add-or-update-a-framework)

# Example (Node.js)

```js
const { listFrameworks } = require('@netlify/framework-info')

console.log(await listFrameworks({ projectDir: './path/to/gatsby/website' }))
// [
//   {
//     name: 'gatsby',
//     category: 'static_site_generator',
//     watchCommands: ['gatsby develop'],
//     publish: 'public',
//     port: 8000,
//     env: { GATSBY_LOGGER: 'yurnalist' }
//   }
// ]

console.log(await listFrameworks({ projectDir: './path/to/vue/website' }))
// [
//   {
//     name: 'vue',
//     category: 'frontend_framework',
//     watchCommands: ['npm run serve'],
//     publish: 'dist',
//     port: 8080,
//     env: {}
//   }
// ]
```

# Example (CLI)

```bash
$ framework-info ./path/to/gatsby/website
gatsby

$ framework-info --long ./path/to/vue/website
[
  {
    "name": "vue",
    "category": "frontend_framework",
    "watchCommands": ["npm run serve"],
    "publish": "dist",
    "port": 8080,
    "env": {}
  }
]
```

# Installation

```bash
npm install @netlify/framework-info
```

# Usage (Node.js)

## listFrameworks(options?)

`options`: `object?`\
_Return value_: `Promise<object[]>`

### Options

#### projectDir

_Type_: `string`\
_Default value_: `process.cwd()`

Path to the website's directory.

#### ignoredWatchCommand

_Type_: `string`

When detecting the watch command, ignore `package.json` `scripts` whose value includes this string.

### Return value

This returns a `Promise` resolving to an array of objects describing each framework. The array can be empty, contain a
single object or several objects.

Each object has the following properties.

#### name

_Type_: `string`

Name such as `"gatsby"`.

#### category

_Type_: `string`

Category among `"static_site_generator"`, `"frontend_framework"` and `"build_tool"`.

#### watchCommands

_Type_: `string[]`

Build command, in watch mode. There might be several alternatives.

#### publish

_Type_: `string`

Relative path to the directory where files are built.

#### port

_Type_: `number`

Server port.

#### env

_Type_: `object`

Environment variables that should be set when calling the watch command.

# Usage (CLI)

```bash
$ framework-info [projectDirectory]
```

This prints the names of each framework.

Available flags:

- `--long`: Show more information about each framework. The output will be a JSON array.
- `--ignoredWatchCommand string`

# Add or update a framework

Each framework is a JSON file in the `/src/frameworks/` directory, with the following properties. All properties are
required.

## name

_Type_: `string`

Name of the framework, lowercase.

## category

_Type_: `string`

One of `"static_site_generator"`, `"frontend_framework"` or `"build_tool"`.

## npmDependencies

_Type_: `string[]`

Framework's npm packages. Any project with one of those packages in their `package.json` (`dependencies` or
`devDependencies`) will be considered as using the framework.

If empty, this is ignored.

## excludedNpmDependencies

_Type_: `string[]`

Inverse of `npmDependencies`. If any project is using one of those packages, it will not be considered as using the
framework.

If empty, this is ignored.

## configFiles

_Type_: `string[]`

Framework's configuration files. Those should be paths relative to the [project's directory](#projectdir). Any project
with one of configuration files will be considered as using the framework.

If empty, this is ignored.

## watchPackageScripts

_Type_: `string[]`

Names of `scripts` in `package.json` which should be returned as watch commands.

Any `scripts` whose value includes [`watchCommand`](#watchcommand) will also be returned as watch command.

## watchCommand

_Type_: `string`

Default watch command. Used if no [`watchPackageScripts`](#watchpackagescripts) was found.

## publish

_Type_: `string`

Directory where built files are written to.

## port

_Type_: `number`

Local server port.

## env

_Type_: `object`

Environment variables that should be set when running the watch command.
