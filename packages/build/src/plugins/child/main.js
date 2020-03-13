require('../../utils/polyfills')

// This needs to be done before `chalk` is loaded
const { setColorLevel, hasColors } = require('../../log/colors')
setColorLevel()

// eslint-disable-next-line import/order
const logProcessErrors = require('log-process-errors')

const { sendEventToParent, getEventsFromParent } = require('../ipc')
const { ERROR_TYPE_SYM } = require('../error')

const { loadPlugin } = require('./load')

// Boot plugin child process.
const bootPlugin = async function() {
  try {
    handleProcessErrors()

    const state = {}
    // We need to fire them in parallel because `process.send()` can be slow
    // to await, i.e. parent might send `load` event before child `ready` event
    // returns.
    await Promise.all([handleEvents(state), sendEventToParent('ready')])
  } catch (error) {
    await handleError(error)
  }
}

// On uncaught exceptions and unhandled rejections, print the stack trace.
// Also, prevent child processes from crashing on uncaught exceptions.
const handleProcessErrors = function() {
  logProcessErrors({ log: handleProcessError, colors: hasColors(), exitOn: [], level: { multipleResolves: 'silent' } })
}

const handleProcessError = async function(error, level) {
  if (level !== 'error') {
    console[level](error)
    return
  }

  await handleError(error)
}

const handleError = async function({
  name,
  message,
  stack,
  [ERROR_TYPE_SYM]: type = DEFAULT_ERROR_TYPE,
  ...errorProps
}) {
  await sendEventToParent('error', { name, message, stack, type, errorProps })
}

const DEFAULT_ERROR_TYPE = 'pluginInternalError'

// Wait for events from parent to perform plugin methods
const handleEvents = async function(state) {
  await getEventsFromParent((callId, eventName, payload) => handleEvent(callId, eventName, payload, state))
}

const handleEvent = async function(callId, eventName, payload, state) {
  const response = await EVENTS[eventName](payload, state)
  await sendEventToParent(callId, response)
}

// Initial plugin load
const load = async function(payload, state) {
  const { context, pluginCommands } = await loadPlugin(payload)
  state.context = context
  return { pluginCommands }
}

// Run a specific plugin event handler
const run = async function(
  { originalEvent, error },
  { context: { pluginCommands, api, utils, constants, inputs, netlifyConfig } },
) {
  const { method } = pluginCommands.find(pluginCommand => pluginCommand.originalEvent === originalEvent)
  const runOptions = { api, utils, constants, inputs, netlifyConfig, error }
  addBackwardCompatibility(runOptions)
  await method(runOptions)
}

// Add older names, kept for backward compatibility. Non-enumerable.
// TODO: remove after being out of beta
const addBackwardCompatibility = function(runOptions) {
  Object.defineProperties(runOptions, {
    pluginConfig: { value: runOptions.inputs },
  })
}

const EVENTS = { load, run }

bootPlugin()
