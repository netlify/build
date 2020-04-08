const { getBuildCommandDescription } = require('../log/description')

// Retrieve an error's location to print in logs.
// Each error type has its own logic (or none if there's no location to print).
const getLocationBlock = function({ stack, location, getLocation }) {
  // No location to print
  if (getLocation === undefined && stack === undefined) {
    return
  }

  const locationString = serializeLocation({ stack, location, getLocation })
  return { name: 'Error location', value: locationString }
}

const serializeLocation = function({ stack, location, getLocation }) {
  // The location is only the stack trace
  if (getLocation === undefined) {
    return stack
  }

  const locationString = getLocation(location)
  return [locationString, stack].filter(Boolean).join('\n')
}

const getBuildCommandLocation = function({ buildCommand, configPath }) {
  const description = getBuildCommandDescription(configPath)
  return `In ${description}:
${buildCommand}`
}

const getBuildFailLocation = function({ event, package, local }) {
  const eventMessage = getEventMessage(event)
  const packageLocation = getPackageLocation(package, local)
  return `${eventMessage} ${packageLocation}`
}

const getEventMessage = function(event) {
  if (event === 'load') {
    return `While loading`
  }

  return `In "${event}" event in`
}

const getPackageLocation = function(package, local) {
  const localString = local ? 'local plugin' : 'npm package'
  return `${localString} "${package}"`
}

const getApiLocation = function({ endpoint, parameters }) {
  return `While calling the Netlify API endpoint '${endpoint}' with:\n${JSON.stringify(parameters, null, 2)}`
}

module.exports = {
  getLocationBlock,
  getBuildCommandLocation,
  getBuildFailLocation,
  getApiLocation,
}
