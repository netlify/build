const { promisify } = require('util')

const pEvent = require('p-event')
const uuid = require('uuid/v4')

const { buildError } = require('../error/build')
const { addErrorInfo } = require('../error/info')

// Send event from child to parent process then wait for response
// We need to fire them in parallel because `process.send()` can be slow
// to await, i.e. child might send response before parent start listening for it
const callChild = async function(childProcess, eventName, payload) {
  const callId = uuid()
  const [response] = await Promise.all([
    getEventFromChild(childProcess, callId),
    sendEventToChild(childProcess, callId, eventName, payload),
  ])
  return response
}

// Receive event from child to parent process
// Wait for either:
//  - `message` event with a specific `callId`
//  - `message` event with an `error` `callId` indicating an exception in the
//    child process
//  - child process `exit`
// In the later two cases, we propagate the error.
// We need to make `p-event` listeners are properly cleaned up too.
const getEventFromChild = async function(childProcess, callId) {
  if (!childProcess.connected) {
    const error = new Error('Could not receive event from child process because it already exited')
    addErrorInfo(error, { type: 'ipc' })
    throw error
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
  const [, { errorProps, ...values }] = await errorPromise
  throw buildError({ ...values, ...errorProps })
}

const getExit = async function(exitPromise) {
  const [exitCode, signal] = await exitPromise
  const error = new Error(`Plugin exited with exit code ${exitCode} and signal ${signal}.
Instead of calling process.exit(), plugin methods should either return (on success) or throw errors (on failure).`)
  addErrorInfo(error, { type: 'ipc' })
  throw error
}

// Send event from parent to child process
const sendEventToChild = async function(childProcess, callId, eventName, payload) {
  const payloadA = serializePayload(payload)
  await promisify(childProcess.send.bind(childProcess))([callId, eventName, payloadA])
}

// Respond to events from parent to child process.
// This runs forever until `childProcess.kill()` is called.
const getEventsFromParent = async function(callback) {
  return new Promise((resolve, reject) => {
    process.on('message', async message => {
      try {
        const [callId, eventName, payload] = message
        const payloadA = parsePayload(payload)
        await callback(callId, eventName, payloadA)
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

// Errors are not serializable through `child_process` `ipc` so we need to
// convert from/to plain objects.
// TODO: use `child_process.spawn()` `serialization: 'advanced'` option after
// dropping support for Node.js <=13.2.0
const serializePayload = function({ error: { name, message, stack, ...errorProps } = {}, ...payload }) {
  if (name === undefined) {
    return payload
  }

  return { ...payload, error: { ...errorProps, name, message, stack } }
}

const parsePayload = function({ error = {}, ...payload }) {
  if (error.name === undefined) {
    return payload
  }

  const errorA = buildError(error)
  return { ...payload, error: errorA }
}

module.exports = {
  callChild,
  getEventFromChild,
  getEventsFromParent,
  sendEventToParent,
}
