'use strict'

const { platform } = require('process')

const execa = require('execa')

const { addErrorInfo } = require('../error/info')
const { getBuildCommandDescription } = require('../log/description')
const { logBuildCommandStart } = require('../log/messages/commands')
const { getBuildCommandStdio, handleBuildCommandOutput } = require('../log/stream')

// Fire `build.command`
const coreCommand = async function ({
  configPath,
  buildDir,
  nodePath,
  childEnv,
  logs,
  netlifyConfig: {
    build: { command: buildCommand, commandOrigin: buildCommandOrigin },
  },
}) {
  logBuildCommandStart(logs, buildCommand)

  const stdio = getBuildCommandStdio(logs)
  const childProcess = execa(buildCommand, {
    shell: SHELL,
    cwd: buildDir,
    preferLocal: true,
    execPath: nodePath,
    env: childEnv,
    extendEnv: false,
    stdio,
  })

  try {
    const buildCommandOutput = await childProcess
    handleBuildCommandOutput(buildCommandOutput, logs)
    return {}
  } catch (error) {
    handleBuildCommandOutput(error, logs)
    addErrorInfo(error, { type: 'buildCommand', location: { buildCommand, buildCommandOrigin, configPath } })
    throw error
  }
}

// We use Bash on Unix and `cmd.exe` on Windows
const SHELL = platform === 'win32' ? true : 'bash'

const coreCommandDescription = function ({
  netlifyConfig: {
    build: { commandOrigin: buildCommandOrigin },
  },
}) {
  return getBuildCommandDescription(buildCommandOrigin)
}

const hasBuildCommand = function ({
  netlifyConfig: {
    build: { command: buildCommand },
  },
}) {
  return buildCommand !== undefined && buildCommand !== ''
}

const buildCommandCore = {
  event: 'onBuild',
  coreCommand,
  coreCommandId: 'build_command',
  coreCommandName: 'build.command',
  coreCommandDescription,
  condition: hasBuildCommand,
}

module.exports = { buildCommandCore }
