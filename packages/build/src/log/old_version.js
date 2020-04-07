const {
  env: { NETLIFY_BUILD_TEST },
  stdout,
} = require('process')

const readPkgUp = require('read-pkg-up')
const UpdateNotifier = require('update-notifier')

// Many build errors happen in local builds that do not use the latest version
// of `@netlify/build`. We print a warning message on those.
// We only print this when Netlify CLI has been used. Programmatic usage might
// come from a deep dependency calling `@netlify/build` and user might not be
// able to take any upgrade action, making the message noisy.
const logOldCliVersionError = async function(mode) {
  if (mode !== 'cli') {
    return
  }

  const pkg = await getPkg()
  UpdateNotifier({ pkg, updateCheckInterval: 1 }).notify({
    message: OLD_VERSION_MESSAGE,
    shouldNotifyInNpmScript: true,
  })
}

const getPkg = async function() {
  const { packageJson } = await readPkgUp({ cwd: __dirname, normalize: false })

  // TODO: Find a way to test this without injecting code in the `src/`
  if (NETLIFY_BUILD_TEST) {
    // `update-notifier` does not do anything if not in a TTY.
    // In tests, we need to monkey patch this
    stdout.isTTY = true

    return { ...packageJson, version: '0.0.1' }
  }

  return packageJson
}

const OLD_VERSION_MESSAGE = `Please update netlify-cli to its latest version.
If netlify-cli is already the latest version,
please update your dependencies lock file instead.`

module.exports = { logOldCliVersionError }
