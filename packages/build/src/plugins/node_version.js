'use strict'

const { version: currentVersion, execPath } = require('process')

const execa = require('execa')
const { satisfies, clean: cleanVersion } = require('semver')

const {
  engines: { node: coreNodeVersionRange },
} = require('../../package.json')
const { addErrorInfo } = require('../error/info')

// Retrieve Node.js version from `--node-path`
const getUserNodeVersion = async function (nodePath) {
  // No `--node-path` CLI flag
  if (nodePath === execPath) {
    return getCurrentNodeVersion()
  }

  const result = NVM_NODE_VERSION_REGEXP.exec(nodePath)
  if (result !== null) {
    return result[1]
  }

  const { stdout } = await execa(nodePath, ['--version'], { reject: false })
  const version = cleanVersion(stdout)
  if (version === null) {
    throwUserError(`Invalid --node-path CLI flag: ${nodePath}`)
  }

  return version
}

// Retrieve Node.js version if the Node.js path is using nvm.
// `node.exe` on Windows, `bin/node` on Unix.
const NVM_NODE_VERSION_REGEXP = /[/\\]v(\d+\.\d+\.\d+)[/\\](bin[/\\]node|node.exe)$/

// Retrieve Node.js version from current process
const getCurrentNodeVersion = function () {
  return cleanVersion(currentVersion)
}

// Ensure Node.js version is recent enough to run this plugin
const checkNodeVersion = function ({
  childNodeVersion,
  packageName,
  pluginPackageJson: { engines: { node: pluginNodeVersionRange } = {} } = {},
}) {
  // Build plugins are instrumented with a wrapper code which has a minimal
  // allowed Node.js version.
  // A mismatch can only happen in the conditions described below since:
  //  - production builds use a pinned version, except for local plugins and
  //    plugins added to `package.json`
  //  - Netlify CLI has the same minimal allowed Node.js version as
  //    `@netlify/build`, so if users can run Netlify CLI, everything is good
  if (!satisfies(childNodeVersion, coreNodeVersionRange)) {
    throwUserError(`The Node.js version is ${childNodeVersion} but it should be ${coreNodeVersionRange} when using build plugins either:
  - from the same repository (as opposed to npm modules)
  - or added to "package.json"`)
  }

  // Plugins can also set a minimal version using `engines.node`
  if (pluginNodeVersionRange && !satisfies(childNodeVersion, pluginNodeVersionRange)) {
    throwUserError(
      `The Node.js version is ${childNodeVersion} but the plugin "${packageName}" requires ${pluginNodeVersionRange}`,
    )
  }
}

const throwUserError = function (message) {
  const error = new Error(message)
  addErrorInfo(error, { type: 'resolveConfig' })
  throw error
}

module.exports = { getUserNodeVersion, getCurrentNodeVersion, checkNodeVersion }
