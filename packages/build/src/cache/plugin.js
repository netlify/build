const { homedir } = require('os')
const {
  version,
  env: { TEST_CACHE_PATH },
} = require('process')

const { logCacheStart, logCacheDir } = require('../log/main')

// Save/restore cache core plugin
const cachePlugin = {
  name: '@netlify/plugin-cache-core',
  async onSaveCache({ utils: { cache } }) {
    logCacheStart()

    await Promise.all(ARTIFACTS.map(path => saveCache(path, cache)))
  },
}

// Cache a single directory
const saveCache = async function(path, cache) {
  // In tests we don't run caching since it is slow and make source directory
  // much bigger
  if (TEST_CACHE_PATH !== undefined && TEST_CACHE_PATH !== path) {
    return
  }

  const success = await cache.save(path)

  // istanbul ignore else
  if (success) {
    logCacheDir(path)
  }
}

// List of directories to cache
const HOME = homedir()
const ARTIFACTS = [
  // Node modules
  'node_modules',
  // Bower components
  'bower_components',
  // Ruby gems
  '.bundle',
  // Python virtualenv
  '.venv',
  // WAPM packages (WebAssembly)
  'wapm_packages',
  // Yarn
  `${HOME}/.yarn_cache`,
  // Pip
  `${HOME}/.cache/pip`,
  // Emacs cask
  `${HOME}/.cask`,
  // Emacs
  `${HOME}/.emacs.d`,
  // Maven
  `${HOME}/.m2`,
  // Boot
  `${HOME}/.boot`,
  // Composer
  `${HOME}/.composer`,
  // Wasmer
  `${HOME}/.wasmer/cache`,
  // Go dependencies
  `${HOME}/.gimme_cache`,
  // TODO: the buildbot currently uses different file paths. Once Netlify Build
  // handles both saving cache and restoring cache, this should not be an issue
  // anymore.
  //   CACHE_DIR/node_version -> CACHE_DIR/.nvm/versions/node[/$NODE_VERSION]
  //   CACHE_DIR/ruby_version -> CACHE_DIR/.rvm/rubies[/ruby-$RUBY_VERSION]
  // nvm
  `${HOME}/.nvm/versions/node/${version}`,
  // TODO: only cache rvm when the version is not already in the Docker image,
  // i.e. it is a custom version
  // rvm
  `${HOME}/.rvm/rubies`,
]

module.exports = cachePlugin
