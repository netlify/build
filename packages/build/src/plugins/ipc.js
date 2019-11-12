const { promisify } = require('util')

const pEvent = require('p-event')

// Send event from child to parent process then wait for response
// We need to fire them in parallel because `process.send()` can be slow
// to await, i.e. child might send response before parent start listening for it
const callChild = async function(childProcess, eventName, payload) {
  const [response] = await Promise.all([
    getEventFromChild(childProcess, eventName),
    sendEventToChild(childProcess, eventName, payload),
  ])
  return response
}

// Receive event from child to parent process
const getEventFromChild = async function(childProcess, expectedEvent) {
  if (!childProcess.connected) {
    throw new Error(`Could not receive event '${expectedEvent}' from child process because it already exited`)
  }

  const [eventName, response] = await getMessageFromChild(childProcess)

  if (eventName === 'error') {
    throw new Error(response.stack)
  }

  if (expectedEvent !== undefined && expectedEvent !== eventName) {
    throw new Error(`Expected event '${expectedEvent}' instead of '${eventName}'`)
  }

  return response
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

// Send event from parent to child process
const sendEventToChild = async function(childProcess, eventName, payload) {
  await promisify(childProcess.send.bind(childProcess))([eventName, payload])
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

// Send event from child to parent process
const sendEventToParent = async function(eventName, payload) {
  await promisify(process.send.bind(process))([eventName, payload])
}

module.exports = {
  callChild,
  getEventFromChild,
  getEventsFromParent,
  sendEventToParent,
}
