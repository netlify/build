const { promisify } = require('util')

const pEvent = require('p-event')
const uuid = require('uuid/v4')

// Send event from child to parent process then wait for response
// We need to fire them in parallel because `process.send()` can be slow
// to await, i.e. child might send response before parent start listening for it
const callChild = async function(childProcess, eventName, payload) {
  const callId = uuid()
  const [response] = await Promise.all([
    getEventFromChild(childProcess, callId),
    sendEventToChild(childProcess, eventName, { ...payload, callId }),
  ])
  return response
}

// Receive event from child to parent process
// Wait for `message` event. However stops if child process exits.
// We need to make `p-event` listeners are properly cleaned up too.
const getEventFromChild = async function(childProcess, callId) {
  if (!childProcess.connected) {
    throw new Error('Could not receive event from child process because it already exited')
  }

  const messagePromise = pEvent(childProcess, 'message', { filter: ([actualCallId]) => actualCallId === callId })
  const errorPromise = pEvent(childProcess, 'message', { filter: ([actualCallId]) => actualCallId === 'error' })
  const exitPromise = pEvent(childProcess, 'exit', { multiArgs: true })
  try {
    return await Promise.race([getMessage(messagePromise), getError(errorPromise), getExit(exitPromise)])
  } finally {
    messagePromise.cancel()
    errorPromise.cancel()
    exitPromise.cancel()
  }
}

const getMessage = async function(messagePromise) {
  const [, response] = await messagePromise
  return response
}

const getError = async function(errorPromise) {
  const [, { stack }] = await errorPromise
  throw new Error(stack)
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
const sendEventToParent = async function(callId, payload) {
  await promisify(process.send.bind(process))([callId, payload])
}

module.exports = {
  callChild,
  getEventFromChild,
  getEventsFromParent,
  sendEventToParent,
}
