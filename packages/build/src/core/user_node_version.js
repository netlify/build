'use strict'

const { version: currentVersion, execPath } = require('process')

const execa = require('execa')
const { clean: cleanVersion } = require('semver')

const { addErrorInfo } = require('../error/info')

// Retrieve Node.js version if the Node.js path is using nvm.
// `node.exe` on Windows, `bin/node` on Unix.
const NVM_NODE_VERSION_REGEXP = /[/\\]v(\d+\.\d+\.\d+)[/\\](bin[/\\]node|node.exe)$/

// Retrieve Node.js version from current process
const getCurrentNodeVersion = function () {
  return cleanVersion(currentVersion)
}

// Retrieve Node.js version from `--node-path` or fallback to extracting the current Node.js process version
const getUserNodeVersion = async function (nodePath) {
  // No `--node-path` CLI flag, use the current node process version
  if (nodePath === execPath) {
    return getCurrentNodeVersion()
  }

  // Extract version from path
  const result = NVM_NODE_VERSION_REGEXP.exec(nodePath)
  if (result !== null) {
    return result[1]
  }

  // Fallback to actually running `node --version` with the given nodePath
  const { stdout } = await execa(nodePath, ['--version'], { reject: false })
  const version = cleanVersion(stdout)

  if (version === null) {
    const error = new Error(`Invalid --node-path CLI flag: ${nodePath}`)
    addErrorInfo(error, { type: 'resolveConfig' })
    throw error
  }

  return version
}

module.exports = { getUserNodeVersion }
