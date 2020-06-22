const { stdout } = require('process')

const UpdateNotifier = require('update-notifier')

const corePackageJson = require('../../package.json')

// Many build errors happen in local builds that do not use the latest version
// of `@netlify/build`. We print a warning message on those.
// We only print this when Netlify CLI has been used. Programmatic usage might
// come from a deep dependency calling `@netlify/build` and user might not be
// able to take any upgrade action, making the message noisy.
const logOldCliVersionError = function({ mode, testOpts }) {
  if (mode !== 'cli') {
    return
  }

  const corePackageJson = getCorePackageJson(testOpts)
  UpdateNotifier({ pkg: corePackageJson, updateCheckInterval: 1 }).notify({
    message: OLD_VERSION_MESSAGE,
    shouldNotifyInNpmScript: true,
  })
}

const getCorePackageJson = function(testOpts) {
  // TODO: Find a way to test this without injecting code in the `src/`
  if (testOpts.oldCliLogs) {
    // `update-notifier` does not do anything if not in a TTY.
    // In tests, we need to monkey patch this
    stdout.isTTY = true

    return { ...corePackageJson, version: '0.0.1' }
  }

  return corePackageJson
}

const OLD_VERSION_MESSAGE = `Please update netlify-cli to its latest version.
If netlify-cli is already the latest version,
please update your dependencies lock file instead.`

module.exports = { logOldCliVersionError }
