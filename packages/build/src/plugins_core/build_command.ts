import { platform } from 'process'

import { trace } from '@opentelemetry/api'
import { wrapTracer } from '@opentelemetry/api/experimental'
import { execa, type ExecaError } from 'execa'

import { addErrorInfo } from '../error/info.js'
import { getBuildCommandDescription } from '../log/description.js'
import type { Logs } from '../log/logger.js'
import { logBuildCommandStart } from '../log/messages/steps.js'
import { getBuildCommandStdio, handleBuildCommandOutput } from '../log/stream.js'

const tracer = wrapTracer(trace.getTracer('build-command'))

// `@netlify/config` sets `build.commandOrigin` whenever `build.command` is set
type BuildCommandConfig = { build: { command: string; commandOrigin: string } }

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
}: {
  configPath: string | undefined
  buildDir: string
  nodePath: string
  childEnv: NodeJS.ProcessEnv
  logs: Logs | undefined
  netlifyConfig: BuildCommandConfig
}) {
  return tracer.withActiveSpan('build.command', async (span) => {
    span.setAttributes({
      'build.command.origin': buildCommandOrigin,
      'build.cwd': buildDir,
    })
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
      // execa always rejects with an `ExecaError`, which its promise type cannot express
      const execaError = error as ExecaError
      // In our test environment we use `stdio: 'pipe'` on the build command, meaning our `stdout/stderr` output are
      // buffered and consequently added to `error.message`. To avoid this and end up with duplicated output in our
      // logs/snapshots we need to rely on `error.shortMessage`.
      execaError.message = execaError.shortMessage
      handleBuildCommandOutput(execaError, logs)
      addErrorInfo(execaError, { type: 'buildCommand', location: { buildCommand, buildCommandOrigin, configPath } })
      throw execaError
    }
  })
}

// We use Bash on Unix and `cmd.exe` on Windows
const SHELL = platform === 'win32' ? true : 'bash'

const coreStepDescription = function ({
  netlifyConfig: {
    build: { commandOrigin: buildCommandOrigin },
  },
}: {
  netlifyConfig: BuildCommandConfig
}) {
  return getBuildCommandDescription(buildCommandOrigin)
}

const hasBuildCommand = function ({
  netlifyConfig: {
    build: { command: buildCommand },
  },
}: {
  netlifyConfig: { build: { command?: string | undefined } }
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
