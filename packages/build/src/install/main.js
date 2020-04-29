const execa = require('execa')
const pathExists = require('path-exists')
const { gte: gteVersion } = require('semver')

const { addErrorInfo } = require('../error/info')

// Install Node.js dependencies in a specific directory
const installDependencies = function({ packageRoot, isLocal }) {
  return runCommand({ packageRoot, isLocal, type: 'install' })
}

// Add new Node.js dependencies
const addDependencies = function({ packageRoot, isLocal, packages }) {
  return runCommand({ packageRoot, packages, isLocal, type: 'add' })
}

const runCommand = async function({ packageRoot, packages, isLocal, type }) {
  try {
    const command = await getCommand({ packageRoot, type, isLocal })
    const packagesList = packages === undefined ? '' : ` ${packages.join(' ')}`
    await execa.command(`${command}${packagesList}`, { cwd: packageRoot, all: true })
  } catch (error) {
    const message = getErrorMessage(error.all)
    const errorA = new Error(`Error while installing dependencies in ${packageRoot}\n${message}`)
    addErrorInfo(errorA, { type: 'dependencies' })
    throw errorA
  }
}

// Retrieve the shell command to install or add dependencies
const getCommand = async function({ packageRoot, type, isLocal }) {
  const manager = await getManager(packageRoot)
  const typeA = await getType({ packageRoot, type, manager, isLocal })
  const command = COMMANDS[manager][typeA]
  const commandA = await fixNpmCiCompat(command)
  return commandA
}

const getManager = async function(packageRoot) {
  if (await pathExists(`${packageRoot}/yarn.lock`)) {
    return 'yarn'
  }

  return 'npm'
}

// Lock files should be:
//   - read and written locally since we do package managers on behalf of users
//   - read and written in CI when there is no lock file, since lock files are
//     sometimes used for caching purpose (their content's hash is)
//   - read but not written in CI when there is a lock file, to ensure builds
//     are predictable
// This leads to three modes:
//   - "add": (new packages are installed): lock files are read/written
//   - "installNoLock": !(new packages are installed) && !(we are in CI &&
//     there is a lock file): lock files are read/written
//   - "installLock": !(new packages are installed) && (we are in CI && there is
//     a lock file): lock files are read but not written
const getType = async function({ packageRoot, type, manager, isLocal }) {
  if (type === 'add') {
    return 'add'
  }

  if (isLocal || !(await hasLockFile(manager, packageRoot))) {
    return 'installNoLock'
  }

  return 'installLock'
}

// If manager is yarn, it means we already know yarn.lock exists since we detect
// yarn with the presence of a lock file at the moment
const hasLockFile = async function(manager, packageRoot) {
  return manager === 'yarn' || (await pathExists(`${packageRoot}/package-lock.json`))
}

const COMMANDS = {
  npm: {
    add: 'npm install --no-progress --no-audit --no-fund',
    installNoLock: 'npm install --no-progress --no-audit --no-fund',
    installLock: 'npm ci --no-progress --no-audit --no-fund',
  },
  yarn: {
    add: 'yarn add --no-progress --non-interactive --ignore-workspace-root-check',
    installNoLock: 'yarn install --no-progress --non-interactive',
    installLock: 'yarn install --frozen-lockfile --no-progress --non-interactive',
  },
}

// npm ci was introduced in npm@5.7.0 which is shipped in Node >= 8.12.0 and
// Node >= 10.3.0
// TODO: remove once we stop supporting Node <8.12.0, Node 9 and Node <10.3.0
const fixNpmCiCompat = async function(command) {
  if (!command.includes('npm ci')) {
    return command
  }

  const { stdout } = await execa.command('npm --version')
  if (gteVersion(stdout, NPM_CI_MIN_VERSION)) {
    return command
  }

  return command.replace('npm ci', 'npm install')
}

const NPM_CI_MIN_VERSION = '5.7.0'

// Retrieve message to add to install errors
const getErrorMessage = function(allOutput) {
  return allOutput
    .split('\n')
    .filter(isNotNpmLogMessage)
    .join('\n')
}

// Debug logs shown at the end of npm errors is not useful in Netlify Build
const isNotNpmLogMessage = function(line) {
  return NPM_LOG_MESSAGES.every(message => !line.includes(message))
}
const NPM_LOG_MESSAGES = ['complete log of this run', '-debug.log']

module.exports = { installDependencies, addDependencies }
