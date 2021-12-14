'use strict'

const { listEvents } = require('../plugins/events')
const { buildCommandCore } = require('../plugins_core/build_command')
const { deploySite } = require('../plugins_core/deploy')
const { bundleFunctions } = require('../plugins_core/functions')

// Get all build steps
const getSteps = async function (steps) {
  const stepsA = addCoreSteps(steps)
  const stepsB = await sortSteps(stepsA)
  const events = getEvents(stepsB)
  return { steps: stepsB, events }
}

const addCoreSteps = function (steps) {
  return [buildCommandCore, ...steps, bundleFunctions, deploySite]
}

// Sort plugin steps by event order.
const sortSteps = async function (steps) {
  const EVENTS = await listEvents()
  return EVENTS.flatMap((event) => steps.filter((step) => step.event === event))
}

// Retrieve list of unique events
const getEvents = function (steps) {
  const events = steps.map(getEvent)
  return [...new Set(events)]
}

const getEvent = function ({ event }) {
  return event
}

module.exports = { getSteps }
