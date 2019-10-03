// https://github.com/netlify/build-image/blob/xenial/run-build-functions.sh
const execa = require('execa')
const makeDir = require('make-dir')

const { HOME } = process.env

const NETLIFY_BUILD_BASE = '/opt/buildhome'
const NETLIFY_CACHE_DIR = `${NETLIFY_BUILD_BASE}/cache`

const directories = [
  // make gimme cache
  `${NETLIFY_BUILD_BASE}/.gimme_cache`,
  // # language versions
  `${NETLIFY_CACHE_DIR}/node_version`,
  `${NETLIFY_CACHE_DIR}/ruby_version`,
  // # pwd caches`
  `${NETLIFY_CACHE_DIR}/node_modules`,
  `${NETLIFY_CACHE_DIR}/.bundle`,
  `${NETLIFY_CACHE_DIR}/bower_components`,
  `${NETLIFY_CACHE_DIR}/.venv`,
  `${NETLIFY_CACHE_DIR}/wapm_packages`,
  // # HOME caches
  `${NETLIFY_CACHE_DIR}/.yarn_cache`,
  `${NETLIFY_CACHE_DIR}/.cache`,
  `${NETLIFY_CACHE_DIR}/.cask`,
  `${NETLIFY_CACHE_DIR}/.emacs.d`,
  `${NETLIFY_CACHE_DIR}/.m2`,
  `${NETLIFY_CACHE_DIR}/.boot`,
  `${NETLIFY_CACHE_DIR}/.composer`,
  `${NETLIFY_CACHE_DIR}/.gimme_cache/gopath`,
  `${NETLIFY_CACHE_DIR}/.gimme_cache/gocache`,
  `${NETLIFY_CACHE_DIR}/.wasmer/cache`
]

const globals = {
  GIMME_TYPE: 'binary',
  GIMME_NO_ENV_ALIAS: true,
  GIMME_CGO_ENABLED: true,
  NVM_DIR: `${HOME}/.nvm`,
  RVM_DIR: `${HOME}/.rvm`,
  // Pipenv configuration
  PIPENV_RUNTIME: 2.7,
  PIPENV_VENV_IN_PROJECT: 1,
  PIPENV_DEFAULT_PYTHON_VERSION: 2.7,
  // CI signal
  NETLIFY: true
}

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L5-L57
module.exports = async function runBuildFunction() {
  // Whats NETLIFY_VERBOSE do?
  if (process.env.NETLIFY_VERBOSE) {
    await execa('set', ['-x'])
  }

  /* Set Globals env vars */
  Object.keys(globals).map(key => {
    // eslint-disable-line
    process.env[key] = globals[key]
  })

  /* Make the directories */
  const newDirPaths = await Promise.all(
    directories.map(dir => {
      console.log(`Make directory ${dir}`)
      return makeDir(dir)
    })
  )

  return newDirPaths
}
