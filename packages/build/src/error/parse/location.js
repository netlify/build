'use strict'

const { getBuildCommandDescription, getPluginOrigin } = require('../../log/description')

// Retrieve an error's location to print in logs.
// Each error type has its own logic (or none if there's no location to print).
const getLocationInfo = function ({ stack, location, locationType }) {
  // No location to print
  if (locationType === undefined && stack === undefined) {
    return
  }

  // The location is only the stack trace
  if (locationType === undefined) {
    return stack
  }

  const locationString = LOCATIONS[locationType](location)
  return [locationString, stack].filter(Boolean).join('\n')
}

const getBuildCommandLocation = function ({ buildCommand, buildCommandOrigin }) {
  const description = getBuildCommandDescription(buildCommandOrigin)
  return `In ${description}:
${buildCommand}`
}

const getCoreCommandLocation = function ({ coreCommandName }) {
  return `During ${coreCommandName}`
}

const getBuildFailLocation = function ({ event, packageName, loadedFrom, origin }) {
  const eventMessage = getEventMessage(event)
  const pluginOrigin = getPluginOrigin(loadedFrom, origin)
  return `${eventMessage} "${packageName}" ${pluginOrigin}`
}

const getEventMessage = function (event) {
  if (event === 'load') {
    return `While loading`
  }

  return `In "${event}" event in`
}

const getApiLocation = function ({ endpoint, parameters }) {
  return `While calling the Netlify API endpoint '${endpoint}' with:\n${JSON.stringify(parameters, null, 2)}`
}

const LOCATIONS = {
  buildCommand: getBuildCommandLocation,
  coreCommand: getCoreCommandLocation,
  buildFail: getBuildFailLocation,
  api: getApiLocation,
}

module.exports = { getLocationInfo }
