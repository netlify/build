<img src="static/logo.png" width="400"/><br>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Utility for modifying redirect rules in Netlify Build.

# Examples

```js
module.exports = {
  name: 'example-plugin',
  // Restore file/directory cached in previous builds.
  // Does not do anything if:
  //  - the file/directory already exists locally
  //  - the file/directory has not been cached yet
  async onInit({ utils: { redirects } }) {
    await redirects.get(projectPath)
  },
}
```

# Install

```
npm install @netlify/redirects-utils
```
