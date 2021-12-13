'use strict'

const { setInspectColors } = require('../../log/colors')
const { sendEventToParent, getEventsFromParent } = require('../ipc')

const { handleProcessErrors, handleError } = require('./error')
const { load } = require('./load')
const { run } = require('./run')

// Boot plugin child process.
const bootPlugin = async function () {
  const state = { context: { verbose: false } }

  try {
    handleProcessErrors()
    setInspectColors()

    // We need to fire them in parallel because `process.send()` can be slow
    // to await, i.e. parent might send `load` event before child `ready` event
    // returns.
    await Promise.all([handleEvents(state), sendEventToParent('ready', {}, false)])
  } catch (error) {
    await handleError(error, state.context.verbose)
  }
}

// Wait for events from parent to perform plugin methods
const handleEvents = async function (state) {
  await getEventsFromParent((callId, eventName, payload) => handleEvent({ callId, eventName, payload, state }))
}

// Each event can pass `context` information to the next event
const handleEvent = async function ({
  callId,
  eventName,
  payload,
  state,
  state: {
    context: { verbose },
  },
}) {
  try {
    const { context, ...response } = await EVENTS[eventName](payload, state.context)
    state.context = { ...state.context, ...context }
    await sendEventToParent(callId, response, verbose)
  } catch (error) {
    await handleError(error, verbose)
  }
}

const EVENTS = { load, run }

bootPlugin()
