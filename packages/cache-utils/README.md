<img src="../../static/logo.png" width="400"/><br>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Utility for caching files in Netlify Build.

# Examples

## Simple

```js
module.exports = {
  name: 'example-plugin',
  // Restore file/directory cached in previous builds.
  // Does not do anything if:
  //  - the file/directory already exists locally
  //  - the file/directory has not been cached yet
  async onGetCache({ utils }) {
    await utils.cache.restore('./path/to/file')
  }
  // Cache file/directory for future builds.
  // Does not do anything if:
  //  - the file/directory does not exist locally
  //  - the file/directory is already cached and its contents has not changed
  //    If this is a directory, this includes children's contents
  async onSaveCache({ utils }) {
    await utils.cache.save('./path/to/file')
  }
}
```

## Conditional logic

```js
// Conditional logic can be applied depending on whether the file has been
// previously cached or not
const path = './path/to/file'

module.exports = {
  name: 'example-plugin',
  async onGetCache({ utils }) {
    const { cache } = utils

    if (!(await cache.has(path))) {
      console.log(`File ${path} not cached`)
      return
    }

    console.log(`About to restore cached file ${path}...`)
    if (await cache.restore('./path/to/file')) {
      console.log(`Restored cached file ${path}`)
    }
  },
  async onSaveCache({ utils }) {
    if (await utils.cache.save('./path/to/file')) {
      console.log(`Saved cached file ${path}`)
    }
  },
}
```

## Cache invalidation

```js
module.exports = {
  name: 'example-plugin',
  async onSaveCache({ utils }) {
    await utils.cache.remove('./path/to/file')
  },
}
```

## Time-to-live

```js
// Only cache the following file/directory for 1 hour
module.exports = {
  name: 'example-plugin',
  async onGetCache({ utils }) {
    await utils.cache.restore('./path/to/file', { ttl: 3600 })
  }
  async onSaveCache({ utils: { cache } }) {
    await utils.cache.save('./path/to/file')
  }
}
```

## Fast mode

```js
// Move files to the cache instead of copying them. This is much faster but this
// removes local files, so should only be done when those files won't be used
// anymore by the current build.
module.exports = {
  name: 'example-plugin',
  async onGetCache({ utils }) {
    await utils.cache.restore('./path/to/file', { move: true })
  }
  async onSaveCache({ utils }) {
    await utils.cache.save('./path/to/file', { move: true })
  }
}
```

## Lock files

```js
// Computing whether a big directory of files has changed or not can be slow.
// If that directory has a lockfile or a manifest file that can be used to
// check if its contents has changed, you can pass it to the `digests` option.
// This will speed up cache saving.
// For example, `package-lock.json` and `yarn.lock` are digest files for the
// `node_modules` directory.
module.exports = {
  name: 'example-plugin',
  async onGetCache({ utils }) {
    await utils.cache.restore('node_modules', {
      digests: ['package-lock.json', 'yarn.lock']
    })
  }
  async onSaveCache({ utils }) {
    await utils.cache.save('node_modules', {
      digests: ['package-lock.json', 'yarn.lock']
    })
  }
}
```

## Multiple directories

```js
// Restore/cache several files/directories
module.exports = {
  name: 'example-plugin',
  async onGetCache({ utils }) {
    await utils.cache.restore(['./path/to/file', './path/to/other'])
  }
  async onSaveCache({ utils }) {
    await utils.cache.save(['./path/to/file', './path/to/other'])
  }
}
```

# Install

```
npm install @netlify/cache-utils
```

# API

## save(path, options?)

`path`: `string`\
`options`: `object`\
_Returns_: `Promise<Boolean>`

Cache a file/directory.

Skipped if the file/directory is already cached and its contents has not changed.

Returns `true` if the file/directory was cached, `false` otherwise.

### options

#### move

_Type_: `boolean`\
_Default_: `false`

Move files to the cache instead of copying them. This is much faster but this removes local files, so should only be
done when those files won't be used anymore by the current build.

#### ttl

_Type_: `number` (in seconds)\
_Default_: `undefined`

Only cache the file/directory for a specific amount of time.

#### digests

_Type_: `string[]`\
_Default_: `[]`

Paths to lock files or manifest files that can be used to check if the directory to cache has changed. Using this option
speeds up caching.

## restore(path, options?)

`path`: `string`\
`options`: `object`\
_Returns_: `Promise<Boolean>`

Restore a file/directory previously cached. Skipped if the file/directory already exists locally or if it has not been
cached yet.

Returns `true` if the file/directory was restored, `false` otherwise.

### options

#### move

_Type_: `boolean`\
_Default_: `false`

## remove(path)

`path`: `string`\
_Returns_: `Promise<Boolean>`

Remove a file/directory from the cache. Useful for cache invalidation.

Returns `true` if the file/directory cache was removed, `false` otherwise.

## has(path)

`path`: `string`\
_Returns_: `Promise<Boolean>`

Returns whether a file/directory is currently cached.
