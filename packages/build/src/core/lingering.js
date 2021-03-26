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
    stdout,
  } = await execa(
    'ps axho command | grep -v ps | grep -v grep | grep -v bash | grep -v "/opt/build-bin/buildbot" | grep -v defunct | grep -v "\\[build\\]" | grep -v "@netlify/build" | grep -v "buildbot.*\\[node\\]" | grep -v "gatsby-telemetry" | grep -v "jest-worker" | grep -v "broccoli-babel-transpiler"',
    { shell: 'bash', reject: false },
  )

  const processes = stdout.trim().split('\n')

  if (processes.length === 0) {
    return
  }

  logLingeringProcesses(logs, processes)
}

module.exports = { warnOnLingeringProcesses }
