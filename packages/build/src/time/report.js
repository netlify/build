const { appendFile } = require('fs')
const { promisify } = require('util')

const pAppendFile = promisify(appendFile)

// Record the duration of a build phase, for monitoring.
// We use a file for IPC.
// This file is read by the buildbot at the end of the build, and the metrics
// are sent.
const reportTimers = async function(timers, timersFile) {
  if (timersFile === undefined) {
    return
  }

  const timersLines = timers.map(getTimerLine).join('')
  await pAppendFile(timersFile, timersLines)
}

const getTimerLine = function({ tag, durationMs }) {
  return `${tag} ${durationMs}ms\n`
}

module.exports = { reportTimers }
