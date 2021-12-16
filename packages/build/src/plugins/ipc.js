import process from 'process'
import { promisify } from 'util'

import pEvent from 'p-event'
import { v4 as uuidv4 } from 'uuid'

import { jsonToError, errorToJson } from '../error/build.js'
import { addErrorInfo } from '../error/info.js'
import {
  logSendingEventToChild,
  logSentEventToChild,
  logReceivedEventFromChild,
  logSendingEventToParent,
} from '../log/messages/ipc.js'

// Send event from child to parent process then wait for response
// We need to fire them in parallel because `process.send()` can be slow
// to await, i.e. child might send response before parent start listening for it
export const callChild = async function ({ childProcess, eventName, payload, logs, verbose }) {
  const callId = uuidv4()
  const [response] = await Promise.all([
    getEventFromChild(childProcess, callId),
    sendEventToChild({ childProcess, callId, eventName, payload, logs, verbose }),
  ])
  logReceivedEventFromChild(logs, verbose)
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
export const getEventFromChild = async function (childProcess, callId) {
  if (childProcessHasExited(childProcess)) {
    throw getChildExitError('Could not receive event from child process because it already exited.')
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

const childProcessHasExited = function (childProcess) {
  return !childProcess.connected || childProcess.signalCode !== null || childProcess.exitCode !== null
}

const getMessage = async function (messagePromise) {
  const [, response] = await messagePromise
  return response
}

const getError = async function (errorPromise) {
  const [, error] = await errorPromise
  throw jsonToError(error)
}

const getExit = async function (exitPromise) {
  const [exitCode, signal] = await exitPromise
  throw getChildExitError(`Plugin exited with exit code ${exitCode} and signal ${signal}.`)
}

// Plugins should not terminate processes explicitly:
//  - It prevents specifying error messages to the end users
//  - It makes it impossible to distinguish between bugs (such as infinite loops) and user errors
//  - It complicates child process orchestration. For example if an async operation
//    of a previous event handler is still running, it would be aborted if another
//    is terminating the process.
const getChildExitError = function (message) {
  const error = new Error(`${message}\n${EXIT_WARNING}`)
  addErrorInfo(error, { type: 'ipc' })
  return error
}

const EXIT_WARNING = `The plugin might have exited due to a bug terminating the process, such as an infinite loop.
The plugin might also have explicitly terminated the process, for example with process.exit().
Plugin methods should instead:
  - on success: return
  - on failure: call utils.build.failPlugin() or utils.build.failBuild()`

// Send event from parent to child process
const sendEventToChild = async function ({ childProcess, callId, eventName, payload, logs, verbose }) {
  logSendingEventToChild(logs, verbose)

  const payloadA = serializePayload(payload)
  await promisify(childProcess.send.bind(childProcess))([callId, eventName, payloadA])

  logSentEventToChild(logs, verbose)
}

// Respond to events from parent to child process.
// This runs forever until `childProcess.kill()` is called.
// We need to use `new Promise()` and callbacks because this runs forever.
// eslint-disable-next-line promise/prefer-await-to-callbacks
export const getEventsFromParent = function (callback) {
  return new Promise((resolve, reject) => {
    process.on('message', async (message) => {
      try {
        const [callId, eventName, payload] = message
        const payloadA = parsePayload(payload)
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        return await callback(callId, eventName, payloadA)
      } catch (error) {
        reject(error)
      }
    })
  })
}

// Send event from child to parent process
export const sendEventToParent = async function (callId, payload, verbose, error) {
  logSendingEventToParent(verbose, error)
  await promisify(process.send.bind(process))([callId, payload])
}

// Error static properties are not serializable through `child_process`
// (which uses `v8.serialize()` under the hood) so we need to convert from/to
// plain objects.
const serializePayload = function ({ error = {}, error: { name } = {}, ...payload }) {
  if (name === undefined) {
    return payload
  }

  const errorA = errorToJson(error)
  return { ...payload, error: errorA }
}

const parsePayload = function ({ error = {}, error: { name } = {}, ...payload }) {
  if (name === undefined) {
    return payload
  }

  const errorA = jsonToError(error)
  return { ...payload, error: errorA }
}
