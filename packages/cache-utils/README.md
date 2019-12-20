<img src="static/logo.png" width="400"/><br>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Utility for caching files in Netlify Build.

# Examples

```js
module.exports = {
  name: 'example-plugin',
  // Restore file/directory cached in previous builds.
  // Does not do anything if:
  //  - the file/directory already exists locally
  //  - the file/directory has not been cached yet
  async onGetCache({ utils: { cache } }) {
    await cache.restore('./path/to/file')
  }
  // Cache file/directory for future builds.
  // Does not do anything if:
  //  - the file/directory does not exist locally
  //  - the file/directory is already cached and its contents has not changed
  //    If this is a directory, this includes children's contents
  async onSaveCache({ utils: { cache } }) {
    await cache.save('./path/to/file')
  }
}
```

```js
module.exports = {
  name: 'example-plugin',
  // Conditional logic can be applied depending on whether the file has been
  // previously cached or not
  async onGetCache({ utils: { cache } }) {
    if (await cache.has('./path/to/file')) {
      console.log('Restoring file cached')
      await cache.restore('./path/to/file')
    } else {
      console.log('No file cached')
    }
  },
  // Remove cache so future builds don't use it anymore
  async onSaveCache({ utils: { cache } }) {
    await cache.remove('./path/to/file')
  },
}
```

```js
// Time-to-live: only cache the following file/directory for 1 hour
module.exports = {
  name: 'example-plugin',
  async onGetCache({ utils: { cache } }) {
    await cache.restore('./path/to/file', { ttl: 3600 })
  }
  async onSaveCache({ utils: { cache } }) {
    await cache.save('./path/to/file')
  }
}
```

```js
// Move files to the cache instead of copying them. This is much faster but this
// removes local files, so should only be done when those files won't be used
// anymore by the current build.
module.exports = {
  name: 'example-plugin',
  async onGetCache({ utils: { cache } }) {
    await cache.restore('./path/to/file', { move: true })
  }
  async onSaveCache({ utils: { cache } }) {
    await cache.save('./path/to/file', { move: true })
  }
}
```

```js
// Restore/cache several files/directories
module.exports = {
  name: 'example-plugin',
  async onGetCache({ utils: { cache } }) {
    await cache.restore(['./path/to/file', './path/to/other'])
  }
  async onSaveCache({ utils: { cache } }) {
    await cache.save(['./path/to/file', './path/to/other'])
  }
}
```

# Install

```
npm install @netlify/cache-utils
```
