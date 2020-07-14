[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Utility for caching files in Netlify Build.

# Examples

## Simple

```js
module.exports = {
  // Restore file/directory cached in previous builds.
  // Does not do anything if:
  //  - the file/directory already exists locally
  //  - the file/directory has not been cached yet
  async onPreBuild({ utils }) {
    await utils.cache.restore('./path/to/file')
  }
  // Cache file/directory for future builds.
  // Does not do anything if:
  //  - the file/directory does not exist locally
  async onPostBuild({ utils }) {
    await utils.cache.save('./path/to/file')
  }
}
```

## Multiple directories

```js
// Restore/cache several files/directories
module.exports = {
  async onPreBuild({ utils }) {
    await utils.cache.restore(['./path/to/file', './path/to/other'])
  }
  async onPostBuild({ utils }) {
    await utils.cache.save(['./path/to/file', './path/to/other'])
  }
}
```

# API

## save(path, options?)

`path`: `string`\
`options`: `object`\
_Returns_: `Promise<Boolean>`

Cache a file/directory.

Skipped if the file/directory does not exist locally.

Returns `false` if the file/directory does not exist. Returns `true` otherwise.

### options

#### ttl

_Type_: `number` (in seconds)\
_Default_: `undefined`

Only cache the file/directory for a specific amount of time.

```js
// Only cache the following file/directory for 1 hour
module.exports = {
  async onPreBuild({ utils }) {
    await utils.cache.restore('./path/to/file')
  }
  async onPostBuild({ utils }) {
    await utils.cache.save('./path/to/file', { ttl: 3600 })
  }
}
```

#### digests

_Type_: `string[]`\
_Default_: `[]`

Paths to lock files or manifest files that can be used to check if the directory to cache has changed. Using this option
speeds up caching.

```js
// If that directory has a lockfile or a manifest file, use it to check if its
// contents has changed. This will speed up cache saving.
// For example, `package-lock.json` and `yarn.lock` are digest files for the
// `node_modules` directory.
module.exports = {
  async onPreBuild({ utils }) {
    await utils.cache.restore('node_modules')
  }
  async onPostBuild({ utils }) {
    await utils.cache.save('node_modules', {
      digests: ['package-lock.json', 'yarn.lock']
    })
  }
}
```

#### cwd

_Type_: `string` \
_Default_: `process.cwd()`

Current directory used to resolve relative paths.

## restore(path, options?)

`path`: `string`\
`options`: `object`\
_Returns_: `Promise<Boolean>`

Restore a file/directory previously cached. Skipped if the file/directory already exists locally or if it has not been
cached yet.

Please be careful: this overwrites the local file/directory if any exists.

Returns `false` if the file/directory was not cached yet. Returns `true` otherwise.

### options

#### cwd

_Type_: `string` \
_Default_: `process.cwd()`

Current directory used to resolve relative paths.

## remove(path, options?)

`path`: `string`\
_Returns_: `Promise<Boolean>`

Remove a file/directory from the cache. Useful for cache invalidation.

Returns `false` if the file/directory was not cached yet. Returns `true` otherwise.

```js
module.exports = {
  async onPostBuild({ utils }) {
    await utils.cache.remove('./path/to/file')
  },
}
```

### options

#### cwd

_Type_: `string` \
_Default_: `process.cwd()`

Current directory used to resolve relative paths.

## has(path, options?)

`path`: `string`\
_Returns_: `Promise<Boolean>`

Returns whether a file/directory is currently cached.

```js
// Conditional logic can be applied depending on whether the file has been
// previously cached or not
const path = './path/to/file'

module.exports = {
  async onPreBuild({ utils }) {
    if (!(await utils.cache.has(path))) {
      console.log(`File ${path} not cached`)
      return
    }

    console.log(`About to restore cached file ${path}...`)
    if (await utils.cache.restore('./path/to/file')) {
      console.log(`Restored cached file ${path}`)
    }
  },
  async onPostBuild({ utils }) {
    if (await utils.cache.save('./path/to/file')) {
      console.log(`Saved cached file ${path}`)
    }
  },
}
```

### options

#### cwd

_Type_: `string` \
_Default_: `process.cwd()`

Current directory used to resolve relative paths.

## list(options?)

_Returns_: `Promise<string[]>`

Returns the absolute paths of the files currently cached. Those are the paths of the files before being saved (or after
being restored), not while being cached.

```js
module.exports = {
  async onPreBuild({ utils }) {
    const files = await utils.cache.list()
    console.log('Cached files', files)
  },
}
```

### options

#### cwd

_Type_: `string` \
_Default_: `process.cwd()`

Current directory used to resolve relative paths.

#### depth

_Type_: `number` \
_Default_: `1`

Number of subdirectories to include. `0` means only top-level directories will be included.
