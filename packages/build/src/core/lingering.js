'use strict'

const execa = require('execa')

const { logLingeringProcesses } = require('../log/messages/core')

// Print a warning when some build processes are still running.
// This is only run in the buildbot at the moment (Linux only).
const warnOnLingeringProcesses = async function ({ mode, logs, testOpts: { silentLingeringProcesses = false } }) {
  if (mode !== 'buildbot' || silentLingeringProcesses) {
    return
  }

  const {
    stdout: processList,
  } = await execa(
    'ps aux | grep -v ps | grep -v grep | grep -v bash | grep -v "/opt/build-bin/buildbot" | grep -v defunct | grep -v "\\[build\\]" | grep -v "@netlify/build" | grep -v "buildbot.*\\[node\\]" | grep -v "gatsby-telemetry" | grep -v "jest-worker" | grep -v "broccoli-babel-transpiler"',
    { shell: 'bash' },
  )

  if (!hasLingeringProcesses(processList)) {
    return
  }

  logLingeringProcesses(logs, processList)
}

// Note that `ps aux` has a header line which is always printed.
const hasLingeringProcesses = function (processList) {
  return processList.split('\n').filter(isNotEmptyLine).length > 1
}

const isNotEmptyLine = function (line) {
  return line.trim() !== ''
}

module.exports = { warnOnLingeringProcesses }
