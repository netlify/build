[![npm version](https://img.shields.io/npm/v/@netlify/framework-info.svg)](https://npmjs.org/package/@netlify/framework-info)
[![Coverage Status](https://codecov.io/gh/netlify/framework-info/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/framework-info)
[![Build](https://github.com/netlify/framework-info/workflows/Build/badge.svg)](https://github.com/netlify/framework-info/actions)
[![Downloads](https://img.shields.io/npm/dm/@netlify/framework-info.svg)](https://www.npmjs.com/package/@netlify/framework-info)

Framework detection utility.

# Installation

```bash
npm install @netlify/framework-info
```

# Usage (Node.js)

## listAll(options?)

`options`: `object?`\
_Return value_: `Promise<object[]>`

```js
const { listAll } = require('@netlify/framework-info')

const frameworks = await listAll()
```

### Options

#### example

_Type_: `boolean`\
_Default value_: `false`

### Return value

This returns a `Promise` resolving to an array of objects describing each framework. Each object has the following
properties.

#### path

_Type_: `string`

Absolute file path to the archive file.

# Usage (CLI)

```bash
$ framework-info [directory]
```
