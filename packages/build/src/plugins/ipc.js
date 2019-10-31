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
    throw new Error(`Could not receive event '${eventName}' from child process because it already exited`)
  }

  const [eventName, payload] = await pEvent(childProcess, 'message')

  if (eventName === 'error') {
    throw new Error(payload.stack)
  }

  validateEventName(eventName, expectedEvent)

  return { eventName, payload }
}

// Receive event from parent to child process
const getEventFromParent = async function(expectedEvent) {
  const [eventName, payload] = await pEvent(process, 'message')
  validateEventName(eventName, expectedEvent)
  return { eventName, payload }
}

const validateEventName = function(eventName, expectedEvent) {
  if (expectedEvent !== undefined && expectedEvent !== eventName) {
    throw new Error(`Expected event '${expectedEvent}' instead of '${eventName}'`)
  }
}

// Poll for events from parent to child process
// TODO: replace with
//   `pEvent.iterator(process, 'message', {resolutionEvents: 'exit'})`
// and async iterators after dropping support for Node 8/9
const getEventsFromParent = async function(callback) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { eventName, payload } = await getEventFromParent()

    if (eventName === 'exit') {
      return
    }

    await callback(eventName, payload)
  }
}

module.exports = {
  sendEventToChild,
  sendEventToParent,
  getEventFromChild,
  getEventFromParent,
  getEventsFromParent,
}
