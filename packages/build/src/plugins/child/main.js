require('../../utils/polyfills')

const { setColorLevel, hasColors } = require('../../log/colors')
setColorLevel()

// eslint-disable-next-line import/order
const logProcessErrors = require('log-process-errors')

const { sendEventToParent, getEventsFromParent } = require('../ipc')

const { loadPlugin } = require('./load')

// Boot plugin child process.
const bootPlugin = async function() {
  try {
    handleProcessErrors()

    await sendEventToParent('ready')
    const context = await loadPlugin()
    await handleEvents(context)
  } catch (error) {
    await handleError(error)
  }
}

// On uncaught exceptions and unhandled rejections, print the stack trace.
// Also, prevent child processes from crashing on uncaught exceptions.
const handleProcessErrors = function() {
  logProcessErrors({ log: handleProcessError, colors: hasColors(), exitOn: [] })
}

const handleProcessError = async function(error, level) {
  if (level !== 'error') {
    console[level](error)
    return
  }

  await handleError(error)
}

const handleError = async function(error) {
  await sendEventToParent('error', { stack: error.stack })
}

// Wait for events from parent to perform plugin methods
const handleEvents = async function(context) {
  await getEventsFromParent((eventName, payload) => handleEvent(eventName, payload, context))
}

const handleEvent = async function(eventName, payload, context) {
  const response = await EVENTS[eventName](payload, context)
  await sendEventToParent(eventName, response)
  return response
}

// Run a specific plugin hook method
const run = async function({ hookName, error }, { hooks, api, constants, pluginConfig, config }) {
  const { method } = hooks.find(hookA => hookA.hookName === hookName)
  await method({ api, constants, pluginConfig, config, error })
}

const EVENTS = { run }

bootPlugin()
