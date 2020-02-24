const { white } = require('chalk')

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

const getPluginLoadLocation = function({ package, local }) {
  const packageLocation = getPackageLocation({ package, local })
  return `While loading ${packageLocation}`
}

const getShellCommandLocation = function({ id, shellCommand }) {
  const idA = id.replace('config.', '')
  return `In configuration "${white.bold(idA)}" command:
${white.bold(shellCommand)}`
}

const getPluginCommandLocation = function({ event, package, local }) {
  const packageLocation = getPackageLocation({ package, local })
  return `In "${white.bold(event)}" event in ${packageLocation}`
}

const getPackageLocation = function({ package, local }) {
  const localString = local ? 'local plugin' : 'npm package'
  return `${localString} "${white.bold(package)}"`
}

module.exports = {
  getLocationBlock,
  getPluginLoadLocation,
  getShellCommandLocation,
  getPluginCommandLocation,
}
