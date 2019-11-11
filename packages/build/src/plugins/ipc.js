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

  // If the child process exited, we abort listening to the event
  const [argA, argB] = await pEvent(childProcess, ['message', 'exit'], { multiArgs: true })

  // We distinguish exit event from message event with arity
  if (argB !== undefined) {
    throw new Error(`Plugin exited with exit code ${argA} and signal ${argB}.
Instead of calling process.exit(), plugin methods should either return (on success) or throw errors (on failure).`)
  }

  const [eventName, payload] = argA

  if (eventName === 'error') {
    throw new Error(payload.stack)
  }

  if (expectedEvent !== undefined && expectedEvent !== eventName) {
    throw new Error(`Expected event '${expectedEvent}' instead of '${eventName}'`)
  }

  return { eventName, payload }
}

// Respond to events from parent to child process.
// This runs forever until `childProcess.kill()` is called.
const getEventsFromParent = async function(callback) {
  return new Promise((resolve, reject) => {
    process.on('message', async ([eventName, payload]) => {
      try {
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
