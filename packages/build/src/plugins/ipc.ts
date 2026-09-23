import type { ChildProcess } from 'child_process'
import crypto from 'crypto'
import process from 'process'

import { jsonToError, errorToJson } from '../error/build.js'
import { addErrorInfo } from '../error/info.js'
import type { Logs } from '../log/logger.js'
import {
  logSendingEventToChild,
  logSentEventToChild,
  logReceivedEventFromChild,
  logSendingEventToParent,
} from '../log/messages/ipc.js'

import type { load, LoadPayload } from './child/load.js'
import type { run, RunPayload } from './child/run.js'

// The child keeps each handler's `context` and replies with the rest
type ChildEvents = {
  load: { payload: LoadPayload; response: Omit<Awaited<ReturnType<typeof load>>, 'context'> }
  run: { payload: RunPayload; response: Awaited<ReturnType<typeof run>> }
  shutdown: { payload: Record<string, unknown>; response: Record<string, never> }
}

type ChildEventName = keyof ChildEvents

type Payload = { error?: Error | undefined; [key: string]: unknown }

type SerializedPayload = { error?: Record<string, unknown> | undefined; [key: string]: unknown }

type ParentMessage = [callId: string, eventName: string, payload: SerializedPayload]

type ChildMessage = [callId: string, response: unknown]

// Send event from child to parent process then wait for response
// We need to fire them in parallel because `process.send()` can be slow
// to await, i.e. child might send response before parent start listening for it
export const callChild = async function <EventName extends ChildEventName>({
  childProcess,
  eventName,
  payload,
  logs,
  verbose,
}: {
  childProcess: ChildProcess
  eventName: EventName
  payload: ChildEvents[EventName]['payload']
  logs: Logs | undefined
  verbose: boolean
}): Promise<ChildEvents[EventName]['response']> {
  const callId = crypto.randomUUID()
  const [response] = await Promise.all([
    getEventFromChild(childProcess, callId),
    sendEventToChild({ childProcess, callId, eventName, payload, logs, verbose }),
  ])
  logReceivedEventFromChild(logs, verbose)
  // Sent over IPC by the child's handler for `eventName`
  return response as ChildEvents[EventName]['response']
}

// Receive event from child to parent process
// Wait for either:
//  - `message` event with a specific `callId`
//  - `message` event with an `error` `callId` indicating an exception in the
//    child process
//  - child process `exit`
// In the later two cases, we propagate the error.
export const getEventFromChild = async function (childProcess: ChildProcess, callId: string): Promise<unknown> {
  if (childProcessHasExited(childProcess)) {
    throw getChildExitError('Could not receive event from child process because it already exited.')
  }

  return new Promise((resolve, reject) => {
    const onMessage = function (data: unknown) {
      // Sent over IPC by `sendEventToParent()`
      const message = data as ChildMessage | null | undefined
      if (message?.[0] === callId) {
        cleanup()
        resolve(message[1])
      } else if (message?.[0] === 'error') {
        cleanup()
        // The child sends `errorToJson()`'s return value along with `error`
        reject(jsonToError(message[1] as Record<string, unknown>))
      }
    }
    const onExit = function (exitCode: number | null, signal: NodeJS.Signals | null) {
      cleanup()
      reject(getChildExitError(`Plugin exited with exit code ${String(exitCode)} and signal ${String(signal)}.`))
    }
    const cleanup = function () {
      childProcess.removeListener('message', onMessage)
      childProcess.removeListener('exit', onExit)
    }
    childProcess.on('message', onMessage)
    childProcess.on('exit', onExit)
  })
}

const childProcessHasExited = function (childProcess: ChildProcess): boolean {
  return !childProcess.connected || childProcess.signalCode !== null || childProcess.exitCode !== null
}

// Plugins should not terminate processes explicitly:
//  - It prevents specifying error messages to the end users
//  - It makes it impossible to distinguish between bugs (such as infinite loops) and user errors
//  - It complicates child process orchestration. For example if an async operation
//    of a previous event handler is still running, it would be aborted if another
//    is terminating the process.
const getChildExitError = function (message: string): Error {
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
const sendEventToChild = async function ({
  childProcess,
  callId,
  eventName,
  payload,
  logs,
  verbose,
}: {
  childProcess: ChildProcess
  callId: string
  eventName: string
  payload: Payload
  logs: Logs | undefined
  verbose: boolean
}): Promise<void> {
  logSendingEventToChild(logs, verbose)

  const payloadA = serializePayload(payload)
  const message: ParentMessage = [callId, eventName, payloadA]
  await sendMessage(childProcess.send.bind(childProcess), message)

  logSentEventToChild(logs, verbose)
}

// Respond to events from parent to child process.
// This runs forever until `childProcess.kill()` is called.
// We need to use `new Promise()` and callbacks because this runs forever.
export const getEventsFromParent = function (
  callback: (callId: string, eventName: string, payload: Payload) => Promise<unknown>,
): Promise<never> {
  return new Promise((_resolve, reject) => {
    const onMessage = async function (message: unknown) {
      try {
        // Sent over IPC by `sendEventToChild()`
        const [callId, eventName, payload] = message as ParentMessage
        const payloadA = parsePayload(payload)
        await callback(callId, eventName, payloadA)
      } catch (error) {
        // Always an `Error`: IPC and destructuring throw those, and `callback` handles its own errors
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    }
    process.on('message', (message) => {
      void onMessage(message)
    })
  })
}

// Send event from child to parent process
export const sendEventToParent = async function (
  callId: string,
  payload: unknown,
  verbose: boolean | undefined,
  error?: unknown,
): Promise<void> {
  logSendingEventToParent(verbose ?? false, error)
  // This only runs in plugin child processes, which always have an IPC channel
  if (process.send === undefined) {
    throw new TypeError("Cannot read properties of undefined (reading 'bind')")
  }
  const message: ChildMessage = [callId, payload]
  await sendMessage(process.send.bind(process), message)
}

// Same as `util.promisify()`, whose types cannot pick the callback overload of `send()`
const sendMessage = function (
  send: (message: object, callback: (error: Error | null) => void) => unknown,
  message: object,
): Promise<void> {
  return new Promise((resolve, reject) => {
    send(message, (error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
}

// Error static properties are not serializable through `child_process`
// (which uses `v8.serialize()` under the hood) so we need to convert from/to
// plain objects.
const serializePayload = function ({ error, ...payload }: Payload): SerializedPayload {
  if (error?.name === undefined) {
    return payload
  }

  const errorA = errorToJson(error)
  return { ...payload, error: errorA }
}

const parsePayload = function ({ error = {}, error: { name } = {}, ...payload }: SerializedPayload): Payload {
  if (name === undefined) {
    return payload
  }

  const errorA = jsonToError(error)
  return { ...payload, error: errorA }
}
