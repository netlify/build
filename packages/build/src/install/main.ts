import { homedir } from 'os'

import { execa } from 'execa'

import { addErrorInfo } from '../error/info.js'
import { pathExists } from '../utils/path_exists.js'

type CommandType = 'install' | 'addExact'
type Manager = 'npm' | 'yarn'
type Command = [string, ...string[]]

// Install Node.js dependencies in a specific directory
export const installDependencies = function ({
  packageRoot,
  isLocal,
}: {
  packageRoot: string
  isLocal: boolean
}): Promise<void> {
  return runCommand({ packageRoot, isLocal, type: 'install' })
}

// Add new Node.js dependencies, with exact semver ranges
export const addExactDependencies = function ({
  packageRoot,
  isLocal,
  packages,
}: {
  packageRoot: string
  isLocal: boolean
  packages?: string[]
}): Promise<void> | undefined {
  if (!packages || packages.length === 0) {
    return
  }
  return runCommand({ packageRoot, packages, isLocal, type: 'addExact' })
}

const runCommand = async function ({
  packageRoot,
  packages = [],
  isLocal,
  type,
}: {
  packageRoot: string
  packages?: string[]
  isLocal: boolean
  type: CommandType
}): Promise<void> {
  try {
    const [command, ...args] = await getCommand({ packageRoot, type, isLocal })
    // `addExact` is used to install Netlify Integration/extension plugins, which can be
    // distributed as remote tarball URLs (e.g. `https://*.netlify.app/packages/*.tgz`)
    // instead of npm registry packages. Newer npm versions (npm v12+) disable fetching
    // such "remote" package types by default, so we opt back in for this command only,
    // without affecting the user's global npm config or other install commands.
    const env = type === 'addExact' ? { npm_config_allow_remote: 'all' } : {}
    await execa(command, [...args, ...packages], { cwd: packageRoot, all: true, env })
  } catch (error) {
    // `getCommand()`'s guard is unreachable, so only `execa()` errors land here,
    // and with `all: true` they include the interleaved output
    const { all } = error as { all: string }
    const message = getErrorMessage(all)
    const errorA = new Error(`Error while installing dependencies in ${packageRoot}\n${message}`)
    addErrorInfo(errorA, { type: 'dependencies' })
    throw errorA
  }
}

// Retrieve the shell command to install or add dependencies
const getCommand = async function ({
  packageRoot,
  type,
  isLocal,
}: {
  packageRoot: string
  type: CommandType
  isLocal: boolean
}): Promise<Command> {
  const manager = await getManager(type, packageRoot)
  const command = COMMANDS[manager][type]
  // Unreachable: `getManager()` only returns `yarn` for `install`
  if (command === undefined) {
    throw new Error(`No "${type}" command for ${manager}`)
  }
  const commandA = addYarnCustomCache(command, manager, isLocal)
  return commandA
}

const getManager = async function (type: CommandType, packageRoot: string): Promise<Manager> {
  // `addDependencies()` always uses npm
  if (type === 'addExact') {
    return 'npm'
  }

  if (await pathExists(`${packageRoot}/yarn.lock`)) {
    return 'yarn'
  }

  return 'npm'
}

const COMMANDS: Record<Manager, Partial<Record<CommandType, Command>>> = {
  npm: {
    addExact: ['npm', 'install', '--no-progress', '--no-audit', '--no-fund', '--save-exact'],
    install: ['npm', 'install', '--no-progress', '--no-audit', '--no-fund'],
  },
  yarn: {
    install: ['yarn', 'install', '--no-progress', '--non-interactive'],
  },
}

// In CI, yarn uses a custom cache folder
const addYarnCustomCache = function (command: Command, manager: Manager, isLocal: boolean): Command {
  if (manager !== 'yarn' || isLocal) {
    return command
  }

  return [...command, '--cache-folder', YARN_CI_CACHE_DIR]
}

const YARN_CI_CACHE_DIR = `${homedir()}/.yarn_cache`

// Retrieve message to add to install errors
const getErrorMessage = function (allOutput: string): string {
  return allOutput.split('\n').filter(isNotNpmLogMessage).join('\n')
}

// Debug logs shown at the end of npm errors is not useful in Netlify Build
const isNotNpmLogMessage = function (line: string): boolean {
  return NPM_LOG_MESSAGES.every((message) => !line.includes(message))
}
const NPM_LOG_MESSAGES = ['complete log of this run', '-debug.log']
