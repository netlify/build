import { homedir } from 'os'

import { execa } from 'execa'
import { pathExists } from 'path-exists'

import { addErrorInfo } from '../error/info.js'

// Install Node.js dependencies in a specific directory
export const installDependencies = function ({ packageRoot, isLocal }) {
  return runCommand({ packageRoot, isLocal, type: 'install' })
}

// Add new Node.js dependencies, with exact semver ranges
export const addExactDependencies = function ({ packageRoot, isLocal, packages }) {
  return runCommand({ packageRoot, packages, isLocal, type: 'addExact' })
}

const runCommand = async function ({ packageRoot, packages = [], isLocal, type }) {
  try {
    const [command, ...args] = await getCommand({ packageRoot, type, isLocal })
    await execa(command, [...args, ...packages], { cwd: packageRoot, all: true })
  } catch (error) {
    const message = getErrorMessage(error.all)
    const errorA = new Error(`Error while installing dependencies in ${packageRoot}\n${message}`)
    addErrorInfo(errorA, { type: 'dependencies' })
    throw errorA
  }
}

// Retrieve the shell command to install or add dependencies
const getCommand = async function ({ packageRoot, type, isLocal }) {
  const manager = await getManager(type, packageRoot)
  const command = COMMANDS[manager][type]
  const commandA = addYarnCustomCache(command, manager, isLocal)
  return commandA
}

const getManager = async function (type, packageRoot) {
  // `addDependencies()` always uses npm
  if (type === 'addExact') {
    return 'npm'
  }

  if (await pathExists(`${packageRoot}/yarn.lock`)) {
    return 'yarn'
  }

  return 'npm'
}

const COMMANDS = {
  npm: {
    addExact: ['npm', 'install', '--no-progress', '--no-audit', '--no-fund', '--save-exact'],
    install: ['npm', 'install', '--no-progress', '--no-audit', '--no-fund'],
  },
  yarn: {
    install: ['yarn', 'install', '--no-progress', '--non-interactive'],
  },
}

// In CI, yarn uses a custom cache folder
const addYarnCustomCache = function (command, manager, isLocal) {
  if (manager !== 'yarn' || isLocal) {
    return command
  }

  return [...command, '--cache-folder', YARN_CI_CACHE_DIR]
}

const YARN_CI_CACHE_DIR = `${homedir()}/.yarn_cache`

// Retrieve message to add to install errors
const getErrorMessage = function (allOutput) {
  return allOutput.split('\n').filter(isNotNpmLogMessage).join('\n')
}

// Debug logs shown at the end of npm errors is not useful in Netlify Build
const isNotNpmLogMessage = function (line) {
  return NPM_LOG_MESSAGES.every((message) => !line.includes(message))
}
const NPM_LOG_MESSAGES = ['complete log of this run', '-debug.log']
