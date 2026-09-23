import { promises as fs } from 'fs'
import { inspect } from 'util'

import type { ConfigMutation } from '../../plugins/child/diff.js'
import type { SystemLogger } from '../../plugins_core/types.js'
import { pathExists } from '../../utils/path_exists.js'
import { type Logs, log, logMessage, logSubHeader } from '../logger.js'

type LoggedConfigMutation = Pick<ConfigMutation, 'keysString' | 'value'>

export const logConfigMutations = function (
  logs: Logs | undefined,
  newConfigMutations: LoggedConfigMutation[],
  debug: boolean,
) {
  const configMutationsToLog = debug ? newConfigMutations : newConfigMutations.filter(shouldLogConfigMutation)
  configMutationsToLog.forEach(({ keysString, value }) => {
    const message = getConfigMutationLog(keysString, value)

    log(logs, message)
  })
}

export const systemLogConfigMutations = function (systemLog: SystemLogger, configMutations: LoggedConfigMutation[]) {
  configMutations.forEach(({ keysString, value }) => {
    const message = getConfigMutationLog(keysString, value)

    systemLog(message)
  })
}

// Some configuration mutations are only logged in debug mode
const shouldLogConfigMutation = function ({ keysString }: LoggedConfigMutation) {
  return !HIDDEN_PROPS.some((hiddenProp) => keysString.startsWith(hiddenProp))
}

// `functions` is an object which can have thousands of properties, one per
// function file. This can be very verbose, especially for plugins which create
// many function files like Essential Next.js
const HIDDEN_PROPS = ['functions']

const getConfigMutationLog = function (keysString: string, value: unknown) {
  const newValue = shouldHideConfigValue(keysString) ? '' : ` to ${inspect(value, { colors: false })}`

  return `Netlify configuration property "${keysString}" value changed${newValue}.`
}

const shouldHideConfigValue = function (keysString: string) {
  return SECRET_PROPS.some((secretProp) => keysString.startsWith(secretProp))
}

const SECRET_PROPS = ['build.environment']

export const logConfigOnUpload = async function ({
  logs,
  configPath,
  debug,
}: {
  logs: Logs | undefined
  configPath: string
  debug: boolean
}) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Uploaded config')

  if (!(await pathExists(configPath))) {
    logMessage(logs, 'No netlify.toml')
    return
  }

  const configContents = await fs.readFile(configPath, 'utf8')
  logMessage(logs, configContents.trim())
}

export const logHeadersOnUpload = async function ({
  logs,
  headersPath,
  debug,
}: {
  logs: Logs | undefined
  headersPath: string
  debug: boolean
}) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Uploaded headers')

  if (!(await pathExists(headersPath))) {
    logMessage(logs, 'No headers')
    return
  }

  const headersContents = await fs.readFile(headersPath, 'utf8')
  logMessage(logs, headersContents.trim())
}

export const logRedirectsOnUpload = async function ({
  logs,
  redirectsPath,
  debug,
}: {
  logs: Logs | undefined
  redirectsPath: string
  debug: boolean
}) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Uploaded redirects')

  if (!(await pathExists(redirectsPath))) {
    logMessage(logs, 'No redirects\n')
    return
  }

  const redirectsContents = await fs.readFile(redirectsPath, 'utf8')
  logMessage(logs, `${redirectsContents.trim()}\n`)
}
