'use strict'

const { EVENTS } = require('@netlify/config')

const isAmongEvents = function (events, event) {
  return events.includes(event)
}

// Check if failure of the event should not make the build fail
const isSoftFailEvent = isAmongEvents.bind(null, ['onSuccess', 'onError', 'onEnd'])

// Check if the event is triggered even when the build fails
const runsAlsoOnBuildFailure = isAmongEvents.bind(null, ['onError', 'onEnd'])

// Check if the event is only triggered when the build fails
const runsOnlyOnBuildFailure = isAmongEvents.bind(null, ['onError'])

// Check if the event is happening after deploy
const runsAfterDeploy = isAmongEvents.bind(null, ['onSuccess', 'onEnd'])

module.exports = {
  EVENTS,
  isSoftFailEvent,
  runsAlsoOnBuildFailure,
  runsOnlyOnBuildFailure,
  runsAfterDeploy,
}
