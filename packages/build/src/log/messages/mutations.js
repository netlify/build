'use strict'

const { readFile } = require('fs')
const { inspect, promisify } = require('util')

const pathExists = require('path-exists')

const { log, logMessage, logSubHeader } = require('../logger')

const pReadFile = promisify(readFile)

const logConfigMutations = function (logs, newConfigMutations) {
  newConfigMutations.forEach(({ keysString, value }) => {
    logConfigMutation(logs, keysString, value)
  })
}

const logConfigMutation = function (logs, keysString, value) {
  const newValue = shouldHideConfigValue(keysString) ? '' : ` to ${inspect(value, { colors: false })}`
  log(logs, `Netlify configuration property "${keysString}" value changed${newValue}.`)
}

const shouldHideConfigValue = function (keysString) {
  return SECRET_PROPS.some((secretProp) => keysString.startsWith(secretProp))
}

const SECRET_PROPS = ['build.environment']

const logConfigOnUpload = async function ({ logs, configPath, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Uploaded config')

  if (!(await pathExists(configPath))) {
    logMessage(logs, 'No netlify.toml')
    return
  }

  const configContents = await pReadFile(configPath, 'utf8')
  logMessage(logs, configContents.trim())
}

const logHeadersOnUpload = async function ({ logs, headersPath, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Uploaded headers')

  if (!(await pathExists(headersPath))) {
    logMessage(logs, 'No headers')
    return
  }

  const headersContents = await pReadFile(headersPath, 'utf8')
  logMessage(logs, headersContents.trim())
}

const logRedirectsOnUpload = async function ({ logs, redirectsPath, debug }) {
  if (!debug) {
    return
  }

  logSubHeader(logs, 'Uploaded redirects')

  if (!(await pathExists(redirectsPath))) {
    logMessage(logs, 'No redirects\n')
    return
  }

  const redirectsContents = await pReadFile(redirectsPath, 'utf8')
  logMessage(logs, `${redirectsContents.trim()}\n`)
}

module.exports = {
  logConfigMutations,
  logConfigOnUpload,
  logHeadersOnUpload,
  logRedirectsOnUpload,
}
