<img src="../../static/logo.png" width="400"/><br>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Utility for adding Functions files in Netlify Build.

This allows plugins to dynamically inject Netlify Functions inside users builds.

# Example

```js
module.exports = {
  // Add a Netlify Functions file or directory to a build
  async onPostBuild({ utils }) {
    await utils.functions.add('./path/to/function')
  },
}
```

# API

## add(path)

`path`: `string`\
_Returns_: `Promise`

Add a Functions file or directory to a build.
