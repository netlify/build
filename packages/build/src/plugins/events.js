export { EVENTS } from '@netlify/config'

const isAmongEvents = function (events, event) {
  return events.includes(event)
}

// Check if failure of the event should not make the build fail
export const isSoftFailEvent = isAmongEvents.bind(null, ['onSuccess', 'onError', 'onEnd'])

// Check if the event is triggered even when the build fails
export const runsAlsoOnBuildFailure = isAmongEvents.bind(null, ['onError', 'onEnd'])

// Check if the event is only triggered when the build fails
export const runsOnlyOnBuildFailure = isAmongEvents.bind(null, ['onError'])

// Check if the event is happening after deploy
export const runsAfterDeploy = isAmongEvents.bind(null, ['onSuccess', 'onEnd'])
