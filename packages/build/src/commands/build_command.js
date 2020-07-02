const { platform } = require('process')

const execa = require('execa')
const isPlainObj = require('is-plain-obj')

const { setEnvChanges } = require('../env/changes.js')
const { addErrorInfo } = require('../error/info')
const { logBuildCommandStart, logCiReactWarning } = require('../log/main')
const { getBuildCommandStdio, handleBuildCommandOutput } = require('../log/stream')
const { getPackageJson } = require('../utils/package')

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
    await handleBuildCommandError({
      error: newError,
      buildCommand,
      buildCommandOrigin,
      configPath,
      buildDir,
      env,
      logs,
    })
    return { newError }
  }
}

// We use Bash on Unix and `cmd.exe` on Windows
const SHELL = platform === 'win32' ? true : 'bash'

// When `build.command` fails
const handleBuildCommandError = async function({
  error,
  buildCommand,
  buildCommandOrigin,
  configPath,
  buildDir,
  env,
  logs,
}) {
  addErrorInfo(error, { type: 'buildCommand', location: { buildCommand, buildCommandOrigin, configPath } })

  if (await isCiReactError({ error, env, buildDir })) {
    logCiReactWarning(logs)
  }
}

const isCiReactError = async function({ error, env: { CI }, buildDir }) {
  return (
    error.exitCode === 1 && typeof CI === 'string' && CI.toLowerCase() !== 'false' && (await isCreateReactApp(buildDir))
  )
}

const isCreateReactApp = async function(buildDir) {
  const { packageJson: sitePackageJson } = await getPackageJson(buildDir, { normalize: false })
  const { scripts } = sitePackageJson
  return isPlainObj(scripts) && typeof scripts.build === 'string' && scripts.build.startsWith(CREATE_REACT_APP_BUILD)
}

const CREATE_REACT_APP_BUILD = 'react-scripts build'

module.exports = { fireBuildCommand }
