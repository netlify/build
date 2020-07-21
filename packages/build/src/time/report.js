const { appendFile } = require('fs')
const { promisify } = require('util')

const slugify = require('slugify')

const pAppendFile = promisify(appendFile)

// Initialize the `timers` array
const initTimers = function() {
  return []
}

// Keep a specific timer duration in memory
const addTimer = function(timers, name, durationMs) {
  return [...timers, { name, durationMs }]
}

// Make sure the timer name does not include special characters.
// For example, the `package` of local plugins includes dots.
const normalizeTimerName = function(name) {
  return slugify(name, { strict: true })
}

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

const getTimerLine = function({ name, durationMs }) {
  return `${name} ${durationMs}ms\n`
}

module.exports = { initTimers, addTimer, normalizeTimerName, reportTimers }
