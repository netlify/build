[![npm version](https://img.shields.io/npm/v/@netlify/framework-info.svg)](https://npmjs.org/package/@netlify/framework-info)
[![Coverage Status](https://codecov.io/gh/netlify/framework-info/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/framework-info)
[![Build](https://github.com/netlify/framework-info/workflows/Build/badge.svg)](https://github.com/netlify/framework-info/actions)
[![Downloads](https://img.shields.io/npm/dm/@netlify/framework-info.svg)](https://www.npmjs.com/package/@netlify/framework-info)

Framework detection utility.

Detects which framework a specific website is using. The framework's build/dev commands, directories and server port are
also returned.

The following frameworks are detected:

- Static site generators: Gatsby, Hugo, Jekyll, Next.js, Nuxt, Hexo, Gridsome, Docusaurus, Eleventy, Middleman,
  Phenomic, React-static, Stencil, Vuepress, Assemble, DocPad, Harp, Metalsmith, Roots, Wintersmith
- Front-end frameworks: create-react-app, Vue, Sapper, Angular, Ember, Svelte, Expo, Quasar
- Build tools: Parcel, Brunch, Grunt, Gulp

[Additions and updates are welcome!](#add-or-update-a-framework)

# Example (Node.js)

```js
const { listFrameworks, hasFramework, getFramework } = require('@netlify/framework-info')

console.log(await listFrameworks({ projectDir: './path/to/gatsby/website' }))
// [
//   {
//     name: 'gatsby',
//     category: 'static_site_generator',
//     dev: {
//       commands: ['gatsby develop'],
//       port: 8000
//     },
//     build: {
//       commands: ['gatsby build'],
//       directory: 'public'
//     },
//     env: { GATSBY_LOGGER: 'yurnalist' }
//   }
// ]

console.log(await listFrameworks({ projectDir: './path/to/vue/website' }))
// [
//   {
//     name: 'vue',
//     category: 'frontend_framework',
//     dev: {
//       commands: ['npm run serve'],
//       port: 8080
//     },
//     build: {
//       commands: ['vue-cli-service build'],
//       directory: 'dist'
//     },
//     env: {}
//   }
// ]

console.log(await hasFramework('vue', { projectDir: './path/to/vue/website' }))
// true

console.log(await getFramework('vue', { projectDir: './path/to/vue/website' }))
// {
//   name: 'vue',
//   category: 'frontend_framework',
//   dev: {
//     commands: ['npm run serve'],
//     port: 8080
//   },
//   build: {
//     commands: ['vue-cli-service build'],
//     directory: 'dist'
//   },
//   env: {}
// }
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
    "dev": {
      "commands": ["npm run serve"],
      "port": 8080
    },
    "build": {
      "commands": ["vue-cli-service build"],
      "directory": "dist"
    },
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

#### dev

_Type_: `object`

Information about the dev command.

##### commands

_Type_: `string[]`

Dev command. There might be several alternatives.

##### port

_Type_: `number`

Server port.

#### build

_Type_: `object`

Information about the build command.

##### commands

_Type_: `string[]`

Build command. There might be several alternatives.

##### directory

_Type_: `string`

Relative path to the directory where files are built.

#### env

_Type_: `object`

Environment variables that should be set when calling the dev command.

## hasFramework(frameworkName, options?)

`options`: `object?`\
_Return value_: `Promise<boolean>`

Same as [`listFramework()`](#listframeworksoptions) except only for a specific framework and returns a boolean.

## getFramework(frameworkName, options?)

`options`: `object?`\
_Return value_: `Promise<object>`

Same as [`listFramework()`](#listframeworksoptions) except the framework is passed as argument instead of being
detected. A single framework object is returned.

# Usage (CLI)

```bash
$ framework-info [projectDirectory]
```

This prints the names of each framework.

If known is found, `unknown` is printed.

Available flags:

- `--long`: Show more information about each framework. The output will be a JSON array.

# Add or update a framework

Each framework is a JSON file in the `/src/frameworks/` directory. For example:

```json
{
  "name": "gatsby",
  "category": "static_site_generator",
  "detect": {
    "npmDependencies": ["gatsby"],
    "excludedNpmDependencies": [],
    "configFiles": ["gatsby-config.js"]
  },
  "dev": {
    "command": "gatsby develop",
    "port": 8000
  },
  "build": {
    "command": "gatsby build",
    "directory": "public"
  },
  "env": { "GATSBY_LOGGER": "yurnalist" }
}
```

All properties are required.

## name

_Type_: `string`

Name of the framework, lowercase.

## category

_Type_: `string`

One of `"static_site_generator"`, `"frontend_framework"` or `"build_tool"`.

## detect

_Type_: `object`

Information used to detect this framework

### npmDependencies

_Type_: `string[]`

Framework's npm packages. Any project with one of those packages in their `package.json` (`dependencies` or
`devDependencies`) will be considered as using the framework.

If empty, this is ignored.

### excludedNpmDependencies

_Type_: `string[]`

Inverse of `npmDependencies`. If any project is using one of those packages, it will not be considered as using the
framework.

If empty, this is ignored.

### configFiles

_Type_: `string[]`

Framework's configuration files. Those should be paths relative to the [project's directory](#projectdir). Any project
with one of configuration files will be considered as using the framework.

If empty, this is ignored.

## dev

_Type_: `object`

Parameters to detect the dev command.

### command

_Type_: `string`

Default dev command.

### port

_Type_: `number`

Local dev server port.

## build

_Type_: `object`

Parameters to detect the build command.

### command

_Type_: `string`

Default build command.

### directory

_Type_: `string`

Directory where built files are written to.

## env

_Type_: `object`

Environment variables that should be set when running the dev command.
