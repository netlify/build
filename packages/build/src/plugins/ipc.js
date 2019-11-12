const { promisify } = require('util')

const pEvent = require('p-event')

// Send event from parent to child process
const sendEventToChild = async function(childProcess, eventName, payload) {
  if (!childProcess.connected) {
    throw new Error(`Could not send event '${eventName}' to child process because it already exited`)
  }

  await promisify(childProcess.send.bind(childProcess))([eventName, payload])
}

// Send event from child to parent process
const sendEventToParent = async function(eventName, payload) {
  await promisify(process.send.bind(process))([eventName, payload])
}

// Receive event from child to parent process
const getEventFromChild = async function(childProcess, expectedEvent) {
  if (!childProcess.connected) {
    throw new Error(`Could not receive event '${expectedEvent}' from child process because it already exited`)
  }

  const [eventName, payload] = await getMessageFromChild(childProcess)

  if (eventName === 'error') {
    throw new Error(payload.stack)
  }

  if (expectedEvent !== undefined && expectedEvent !== eventName) {
    throw new Error(`Expected event '${expectedEvent}' instead of '${eventName}'`)
  }

  return { eventName, payload }
}

// Wait for `message` event. However stops if child process exits.
// We need to make `p-event` listeners are properly cleaned up too.
const getMessageFromChild = async function(childProcess) {
  const messagePromise = pEvent(childProcess, 'message')
  const exitPromise = pEvent(childProcess, 'exit', { multiArgs: true })
  try {
    return await Promise.race([messagePromise, getExit(exitPromise)])
  } finally {
    messagePromise.cancel()
    exitPromise.cancel()
  }
}

const getExit = async function(exitPromise) {
  const [exitCode, signal] = await exitPromise
  throw new Error(`Plugin exited with exit code ${exitCode} and signal ${signal}.
Instead of calling process.exit(), plugin methods should either return (on success) or throw errors (on failure).`)
}

// Respond to events from parent to child process.
// This runs forever until `childProcess.kill()` is called.
const getEventsFromParent = async function(callback) {
  return new Promise((resolve, reject) => {
    process.on('message', async message => {
      try {
        const [eventName, payload] = message
        await callback(eventName, payload)
      } catch (error) {
        reject(error)
      }
    })
  })
}

module.exports = {
  sendEventToChild,
  sendEventToParent,
  getEventFromChild,
  getEventsFromParent,
}
