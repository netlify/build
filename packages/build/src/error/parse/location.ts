import { getBuildCommandDescription, getPluginOrigin } from '../../log/description.js'
import type {
  BuildCommandLocation,
  FunctionsBundlingLocation,
  CoreStepLocation,
  PluginLocation,
  APILocation,
  DeployLocation,
} from '../types.js'

// Retrieve an error's location to print in logs.
// Each error type has its own logic (or none if there's no location to print).
export const getLocationInfo = function ({ stack, location, locationType }) {
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

const getBuildCommandLocation = function ({ buildCommand, buildCommandOrigin }: BuildCommandLocation) {
  const description = getBuildCommandDescription(buildCommandOrigin)
  return `In ${description}:
${buildCommand}`
}

const getFunctionsBundlingLocation = function ({ functionName, functionType }: FunctionsBundlingLocation) {
  if (functionType === 'edge') {
    return 'While bundling edge function'
  }

  return `While bundling function "${functionName}"`
}

const getCoreStepLocation = function ({ coreStepName }: CoreStepLocation) {
  return `During ${coreStepName}`
}

const getBuildFailLocation = function ({ event, packageName, loadedFrom, origin }: PluginLocation) {
  const eventMessage = getEventMessage(event)
  const pluginOrigin = getPluginOrigin(loadedFrom, origin)
  return `${eventMessage} "${packageName}" ${pluginOrigin}`
}

const getEventMessage = function (event: string) {
  if (event === 'load') {
    return `While loading`
  }

  return `In "${event}" event in`
}

const getApiLocation = function ({ endpoint, parameters }: APILocation) {
  return `While calling the Netlify API endpoint '${endpoint}' with:\n${JSON.stringify(parameters, null, 2)}`
}

const getDeployLocation = function ({ statusCode }: DeployLocation) {
  return `At deploy the stage with HTTP status code '${statusCode}'`
}

const LOCATIONS = {
  buildCommand: getBuildCommandLocation,
  functionsBundling: getFunctionsBundlingLocation,
  coreStep: getCoreStepLocation,
  buildFail: getBuildFailLocation,
  api: getApiLocation,
  deploy: getDeployLocation,
}
