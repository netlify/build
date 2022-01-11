[![Coverage Status](https://codecov.io/gh/netlify/build/branch/main/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Utility for handling Netlify Functions in Netlify Build plugins.

This allows plugins to:

- list available Netlify Functions
- dynamically inject Netlify Functions inside users builds.

# Example

```js
// Add a Netlify Functions file or directory to a build
export const onPreBuild = async function ({ utils }) {
  await utils.functions.add('./path/to/function')
}
```

# API

## list()

_Returns_: `Promise<object[]>`

Returns the list of Netlify Functions main files as a Promise resolving to an array of objects with the following
properties:

- `name` `{string}`: Function name, as used in the URL `https://{hostname}/.netlify/functions/{name}`
- `mainFile` `{string}`: absolute path to the Function's main file
- `extension` `{string}`: file extension of the Function's main file. For Go Functions, this might be an empty string.
  For Node.js Functions, this is either `.js` or `.zip`.
- `runtime` `"js" | "go"`: Function's programming language

This throws when no `functions` directory was specified by the user, or when it points to a non-existing directory.

## listAll()

_Returns_: `Promise<object[]>`

Same as `list()` except it also returns the files required by the Functions main files. This is much slower. The object
have the following additional member:

- `srcFile` `{string}`: absolute path to the file

## add(path)

`path`: `string`\
_Returns_: `Promise`

Add a Functions file or directory to a build.

This throws when no `functions` directory was specified by the user, or when it points to a non-existing directory.
