import { platform } from 'process'

import execa from 'execa'

import { addErrorInfo } from '../error/info.js'
import { getBuildCommandDescription } from '../log/description.js'
import { logBuildCommandStart } from '../log/messages/steps.js'
import { getBuildCommandStdio, handleBuildCommandOutput } from '../log/stream.js'

// Fire `build.command`
const coreStep = async function ({
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
    // In our test environment we use `stdio: 'pipe'` on the build command, meaning our `stdout/stderr` output are
    // buffered and consequently added to `error.message`. To avoid this and end up with duplicated output in our
    // logs/snapshots we need to rely on `error.shortMessage`.
    error.message = error.shortMessage
    handleBuildCommandOutput(error, logs)
    addErrorInfo(error, { type: 'buildCommand', location: { buildCommand, buildCommandOrigin, configPath } })
    throw error
  }
}

// We use Bash on Unix and `cmd.exe` on Windows
const SHELL = platform === 'win32' ? true : 'bash'

const coreStepDescription = function ({
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

export const buildCommandCore = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'build_command',
  coreStepName: 'build.command',
  coreStepDescription,
  condition: hasBuildCommand,
}
