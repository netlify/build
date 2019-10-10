const { exit } = require('process')

require('../../utils/polyfills')
const { getMessageFromParent, sendMessageToParent } = require('../ipc')
const { setColorLevel } = require('../../log/colors')

const { load } = require('./load')
const { run } = require('./run')

// Main entry point of plugin child processes
const runChild = async function() {
  setColorLevel()

  const { eventName, message } = getMessageFromParent()

  try {
    const response = await EVENTS[eventName](message)
    await sendMessageToParent(response)
  } catch (error) {
    console.error(error)
    exit(1)
  }
}

// Event handlers of plugins.
// Each event is run in its own child process.
const EVENTS = { load, run }

runChild()
