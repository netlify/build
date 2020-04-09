const { homedir } = require('os')
const {
  version,
  env: { TEST_CACHE_PATH },
} = require('process')

const { logCacheDir } = require('../../log/main')

// Save/restore cache core plugin
const cachePlugin = {
  async onPostBuild({ utils: { cache }, constants: { IS_LOCAL } }) {
    await Promise.all(ARTIFACTS.map(({ path, digests }) => saveCache({ path, digests, cache, IS_LOCAL })))
  },
}

// Cache a single directory
const saveCache = async function({ path, digests, cache, IS_LOCAL }) {
  // In tests we don't run caching since it is slow and make source directory
  // much bigger
  if (TEST_CACHE_PATH !== undefined && TEST_CACHE_PATH !== path) {
    return
  }

  const success = await cache.save(path, { move: !IS_LOCAL, digests })

  if (success) {
    logCacheDir(path)
  }
}

// List of directories to cache
const HOME = homedir()
const ARTIFACTS = [
  // Node modules
  { path: 'node_modules', digests: ['package-lock.json', 'yarn.lock'] },
  // Bower components
  { path: 'bower_components' },
  // Ruby gems
  { path: '.bundle' },
  // Python virtualenv
  { path: '.venv' },
  // WAPM packages (WebAssembly)
  { path: 'wapm_packages' },
  // Yarn
  { path: `${HOME}/.yarn_cache` },
  // Pip
  { path: `${HOME}/.cache/pip` },
  // Emacs cask
  { path: `${HOME}/.cask` },
  // Emacs
  { path: `${HOME}/.emacs.d` },
  // Maven
  { path: `${HOME}/.m2` },
  // Boot
  { path: `${HOME}/.boot` },
  // Composer
  { path: `${HOME}/.composer` },
  // Wasmer
  { path: `${HOME}/.wasmer/cache` },
  // Go dependencies
  { path: `${HOME}/.gimme_cache` },
  // TODO: the buildbot currently uses different file paths. Once Netlify Build
  // handles both saving cache and restoring cache, this should not be an issue
  // anymore.
  //   CACHE_DIR/node_version -> CACHE_DIR/.nvm/versions/node[/$NODE_VERSION]
  //   CACHE_DIR/ruby_version -> CACHE_DIR/.rvm/rubies[/ruby-$RUBY_VERSION]
  // nvm
  { path: `${HOME}/.nvm/versions/node/${version}` },
  // TODO: only cache rvm when the version is not already in the Docker image,
  // i.e. it is a custom version
  // rvm
  { path: `${HOME}/.rvm/rubies` },
]

module.exports = cachePlugin
