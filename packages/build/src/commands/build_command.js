const { platform } = require('process')

const execa = require('execa')

const { setEnvChanges } = require('../env/changes.js')
const { addErrorInfo } = require('../error/info')
const { logBuildCommandStart } = require('../log/main')
const { getBuildCommandStdio, handleBuildCommandOutput } = require('../log/stream')

// Fire `build.command`
const fireBuildCommand = async function({
  buildCommand,
  buildCommandOrigin,
  configPath,
  buildDir,
  nodePath,
  childEnv,
  envChanges,
  logs,
}) {
  logBuildCommandStart(logs, buildCommand)

  const env = setEnvChanges(envChanges, { ...childEnv })
  const stdio = getBuildCommandStdio(logs)
  const childProcess = execa(buildCommand, {
    shell: SHELL,
    cwd: buildDir,
    preferLocal: true,
    execPath: nodePath,
    env,
    extendEnv: false,
    stdio,
  })

  try {
    const buildCommandOutput = await childProcess
    handleBuildCommandOutput(buildCommandOutput, logs)
    return {}
  } catch (newError) {
    handleBuildCommandOutput(newError, logs)
    addErrorInfo(newError, { type: 'buildCommand', location: { buildCommand, buildCommandOrigin, configPath } })
    return { newError }
  }
}

// We use Bash on Unix and `cmd.exe` on Windows
const SHELL = platform === 'win32' ? true : 'bash'

module.exports = { fireBuildCommand }
