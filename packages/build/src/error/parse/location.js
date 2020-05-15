const { getBuildCommandDescription } = require('../../log/description')

// Retrieve an error's location to print in logs.
// Each error type has its own logic (or none if there's no location to print).
const getLocationInfo = function({ stack, location, locationType }) {
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

const getBuildCommandLocation = function({ buildCommand, configPath }) {
  const description = getBuildCommandDescription(configPath)
  return `In ${description}:
${buildCommand}`
}

const getBuildFailLocation = function({ event, package, loadedFrom }) {
  const eventMessage = getEventMessage(event)
  const packageLocation = getPackageLocation(package, loadedFrom)
  return `${eventMessage} ${packageLocation}`
}

const getEventMessage = function(event) {
  if (event === 'load') {
    return `While loading`
  }

  return `In "${event}" event in`
}

const getPackageLocation = function(package, loadedFrom) {
  const localString = loadedFrom === 'local' ? 'local plugin' : 'npm package'
  return `${localString} "${package}"`
}

const getApiLocation = function({ endpoint, parameters }) {
  return `While calling the Netlify API endpoint '${endpoint}' with:\n${JSON.stringify(parameters, null, 2)}`
}

const LOCATIONS = {
  buildCommand: getBuildCommandLocation,
  buildFail: getBuildFailLocation,
  api: getApiLocation,
}

module.exports = { getLocationInfo }
