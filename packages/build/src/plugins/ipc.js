const { promisify } = require('util')

const pEvent = require('p-event')
const { v4: uuidv4 } = require('uuid')

const { jsonToError, errorToJson } = require('../error/build')
const { addErrorInfo } = require('../error/info')

// Send event from child to parent process then wait for response
// We need to fire them in parallel because `process.send()` can be slow
// to await, i.e. child might send response before parent start listening for it
const callChild = async function(childProcess, eventName, payload, { plugin, location }) {
  const callId = uuidv4()
  const [response] = await Promise.all([
    getEventFromChild(childProcess, callId, { plugin, location }),
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
const getEventFromChild = async function(childProcess, callId, { plugin, location }) {
  if (childProcessHasExited(childProcess)) {
    throwChildExit('Could not receive event from child process because it already exited.', { plugin, location })
  }

  const messagePromise = pEvent(childProcess, 'message', { filter: ([actualCallId]) => actualCallId === callId })
  const errorPromise = pEvent(childProcess, 'message', { filter: ([actualCallId]) => actualCallId === 'error' })
  const exitPromise = pEvent(childProcess, 'exit', { multiArgs: true })
  try {
    return await Promise.race([
      getMessage(messagePromise),
      getError(errorPromise, { plugin, location }),
      getExit(exitPromise, { plugin, location }),
    ])
  } finally {
    messagePromise.cancel()
    errorPromise.cancel()
    exitPromise.cancel()
  }
}

const childProcessHasExited = function(childProcess) {
  return !childProcess.connected || childProcess.signalCode !== null || childProcess.exitCode !== null
}

const getMessage = async function(messagePromise) {
  const [, response] = await messagePromise
  return response
}

const getError = async function(errorPromise, { plugin, location }) {
  const [, error] = await errorPromise
  const errorA = jsonToError(error, { plugin, location })
  throw errorA
}

const getExit = async function(exitPromise, { plugin, location }) {
  const [exitCode, signal] = await exitPromise
  throwChildExit(`Plugin exited with exit code ${exitCode} and signal ${signal}.`, { plugin, location })
}

// Plugins should not terminate processes explicitly:
//  - It prevents specifying error messages to the end users
//  - It makes it impossible to distinguish between bugs (such as infinite loops) and user errors
//  - It complicates child process orchestration. For example if an async operation
//    of a previous event handler is still running, it would be aborted if another
//    is terminating the process.
const throwChildExit = function(message, { plugin, location }) {
  const error = new Error(`${message}\n${EXIT_WARNING}`)
  addErrorInfo(error, { type: 'ipc', plugin, location })
  throw error
}

const EXIT_WARNING = `The plugin might have exited due to a bug terminating the process, such as an infinite loop.
The plugin might also have explicitly terminated the process, for example with process.exit().
Plugin methods should instead:
  - on success: return
  - on failure: call utils.build.failPlugin() or utils.build.failBuild()`

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
// dropping support for Node.js <=12.6.0
const serializePayload = function({ error = {}, error: { name } = {}, ...payload }) {
  if (name === undefined) {
    return payload
  }

  const errorA = errorToJson(error)
  return { ...payload, error: errorA }
}

const parsePayload = function({ error = {}, error: { name } = {}, ...payload }) {
  if (name === undefined) {
    return payload
  }

  const errorA = jsonToError(error)
  return { ...payload, error: errorA }
}

module.exports = {
  callChild,
  getEventFromChild,
  getEventsFromParent,
  sendEventToParent,
}
