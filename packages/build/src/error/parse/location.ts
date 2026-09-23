import { getBuildCommandDescription, getPluginOrigin } from '../../log/description.js'
import type { AnyErrorLocation } from '../types.js'

// Retrieve an error's location to print in logs.
// Each error type has its own logic (or none if there's no location to print).
export const getLocationInfo = function ({
  stack,
  location,
  locationType,
}: {
  stack: string | undefined
  location: AnyErrorLocation
  locationType: string | undefined
}): string | undefined {
  // No location to print
  if (locationType === undefined && stack === undefined) {
    return
  }

  // The location is only the stack trace
  if (locationType === undefined) {
    return stack
  }

  const getLocation = LOCATIONS[locationType]
  if (getLocation === undefined) {
    throw new TypeError('LOCATIONS[locationType] is not a function')
  }

  const locationString = getLocation(location)
  return [locationString, stack].filter(Boolean).join('\n')
}

// Error information is not validated, so a location cannot rely on its kind
const getBuildCommandLocation = function ({ buildCommand, buildCommandOrigin }: AnyErrorLocation) {
  const description = getBuildCommandDescription(buildCommandOrigin)
  return `In ${String(description)}:
${String(buildCommand)}`
}

const getFunctionsBundlingLocation = function ({ functionName, functionType }: AnyErrorLocation) {
  if (functionType === 'edge') {
    return 'While bundling edge function'
  }

  return `While bundling function "${String(functionName)}"`
}

const getCoreStepLocation = function ({ coreStepName }: AnyErrorLocation) {
  return `During ${String(coreStepName)}`
}

const getBuildFailLocation = function ({ event, packageName, loadedFrom, origin }: AnyErrorLocation) {
  const eventMessage = getEventMessage(event)
  const pluginOrigin = getPluginOrigin(loadedFrom, origin)
  return `${eventMessage} "${String(packageName)}" ${pluginOrigin}`
}

const getEventMessage = function (event: string | undefined) {
  if (event === 'load') {
    return `While loading`
  }

  return `In "${String(event)}" event in`
}

const getApiLocation = function ({ endpoint, parameters }: AnyErrorLocation) {
  return `While calling the Netlify API endpoint '${String(endpoint)}' with:\n${JSON.stringify(parameters, null, 2)}`
}

const getDeployLocation = function ({ statusCode }: AnyErrorLocation) {
  return `At deploy the stage with HTTP status code '${String(statusCode)}'`
}

const LOCATIONS: Partial<Record<string, (location: AnyErrorLocation) => string>> = {
  buildCommand: getBuildCommandLocation,
  functionsBundling: getFunctionsBundlingLocation,
  coreStep: getCoreStepLocation,
  buildFail: getBuildFailLocation,
  api: getApiLocation,
  deploy: getDeployLocation,
}
