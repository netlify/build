import { platform } from 'os'

import { type ExecaChildProcess } from 'execa'
import { satisfies } from 'semver'

// 1 second
const SERVER_KILL_TIMEOUT = 1e3

// 1 second
const SERVER_POLL_INTERVAL = 1e3

// 10 seconds
const SERVER_POLL_TIMEOUT = 1e4

const killProcess = (ps: ExecaChildProcess<string>) => {
  // If the process is no longer running, there's nothing left to do.
  if (ps?.exitCode !== null) {
    return
  }

  return new Promise((resolve, reject) => {
    ps.on('close', resolve)
    ps.on('error', reject)

    // On Windows with Node 21+, there's a bug where attempting to kill a child process
    // results in an EPERM error. Ignore the error in that case.
    // See: https://github.com/nodejs/node/issues/51766
    // We also disable execa's `forceKillAfterTimeout` in this case
    // which can cause unhandled rejection.
    try {
      ps.kill('SIGTERM', {
        forceKillAfterTimeout:
          platform() === 'win32' && satisfies(process.version, '>=21') ? false : SERVER_KILL_TIMEOUT,
      })
    } catch {
      // no-op
    }
  })
}

const waitForServer = async (port: number, ps?: ExecaChildProcess<string>) => {
  const deadline = Date.now() + SERVER_POLL_TIMEOUT
  const signal = AbortSignal.timeout(SERVER_POLL_TIMEOUT)

  while (Date.now() < deadline) {
    // If the process has been killed or exited, the server will never become
    // ready
    if (ps?.killed || ps?.exitCode !== null || ps?.signalCode !== null) {
      return false
    }

    try {
      await fetch(`http://127.0.0.1:${port}`, { signal })

      return true
    } catch {
      await new Promise((resolve) => {
        setTimeout(resolve, SERVER_POLL_INTERVAL)
      })
    }
  }

  return false
}

export { killProcess, waitForServer }
