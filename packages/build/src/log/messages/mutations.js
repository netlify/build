import { promises as fs } from 'fs'
import { inspect } from 'util'

import pathExists from 'path-exists'

import { log, logMessage, logSubHeader } from '../logger.js'

export const logConfigMutations = function (logs, newConfigMutations, debug) {
  const configMutationsToLog = debug ? newConfigMutations : newConfigMutations.filter(shouldLogConfigMutation)
  configMutationsToLog.forEach(({ keysString, value }) => {
    logConfigMutation(logs, keysString, value)
  })
}

// Some configuration mutations are only logged in debug mode
const shouldLogConfigMutation = function ({ keysString }) {
  return !HIDDEN_PROPS.some((hiddenProp) => keysString.startsWith(hiddenProp))
}

// `functions` is an object which can have thousands of properties, one per
// function file. This can be very verbose, especially for plugins which create
// many function files like Essential Next.js
const HIDDEN_PROPS = ['functions']

const logConfigMutation = function (logs, keysString, value) {
  const newValue = shouldHideConfigValue(keysString) ? '' : ` to ${inspect(value, { colors: false })}`
  log(logs, `Netlify configuration property "${keysString}" value changed${newValue}.`)
}

const shouldHideConfigValue = function (keysString) {
  return SECRET_PROPS.some((secretProp) => keysString.startsWith(secretProp))
}

const SECRET_PROPS = ['build.environment']

export const logConfigOnUpload = async function ({ logs, configPath, debug }) {
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

export const logHeadersOnUpload = async function ({ logs, headersPath, debug }) {
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

export const logRedirectsOnUpload = async function ({ logs, redirectsPath, debug }) {
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
