import { setInspectColors } from '../../log/colors.js'
import { getEventsFromParent, sendEventToParent } from '../ipc.js'

import { handleError, handleProcessErrors } from './error.js'
import { load, type LoadPayload, type PluginContext } from './load.js'
import { run, type RunPayload } from './run.js'

// Before the `load` event, only `verbose` is known
type ChildContext = Partial<PluginContext> & Pick<PluginContext, 'verbose'>

type ChildState = { context: ChildContext }

type EventHandler = (
  payload: unknown,
  context: ChildContext,
) => Promise<{ context?: Partial<PluginContext>; [key: string]: unknown }>

// Boot plugin child process.
const bootPlugin = async function () {
  const state: ChildState = { context: { verbose: false } }

  try {
    handleProcessErrors()
    setInspectColors()

    // We need to fire them in parallel because `process.send()` can be slow
    // to await, i.e. parent might send `load` event before child `ready` event
    // returns.
    await Promise.all([handleEvents(state), sendEventToParent('ready', {}, false)])
  } catch (error) {
    await handleError(error, state.context.verbose)
  }
}

// Wait for events from parent to perform plugin methods
const handleEvents = async function (state: ChildState) {
  await getEventsFromParent((callId, eventName, payload) => handleEvent({ callId, eventName, payload, state }))
}

// Each event can pass `context` information to the next event
const handleEvent = async function ({
  callId,
  eventName,
  payload,
  state,
  state: {
    context: { verbose },
  },
}: {
  callId: string
  eventName: string
  payload: unknown
  state: ChildState
}) {
  try {
    const eventHandler = EVENTS[eventName]
    // The parent only sends the events below
    if (eventHandler === undefined) {
      throw new TypeError('EVENTS[eventName] is not a function')
    }
    const { context, ...response } = await eventHandler(payload, state.context)
    state.context = { ...state.context, ...context }
    await sendEventToParent(callId, response, verbose)
  } catch (error) {
    await handleError(error, verbose)
  }
}

// Payloads are sent over IPC by `callChild()`, which types each one by its event name
const EVENTS: Record<string, EventHandler | undefined> = {
  load: (payload) => load(payload as LoadPayload),
  // The parent always sends `load`, which sets the whole context, before `run`
  run: (payload, context) => run(payload as RunPayload, context as PluginContext),
  // async shutdown hook to stop tracing reliably
  shutdown: async () => {
    try {
      const { stopTracing } = await import('@netlify/opentelemetry-sdk-setup')
      await stopTracing()
    } catch {
      // noop as the opentelemetry-sdk-setup is an optional dependency
      // and might not be present in the CLI
    }
    return { context: {} }
  },
}

void bootPlugin()
