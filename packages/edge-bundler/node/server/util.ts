import { platform } from 'os'

import { type ExecaChildProcess } from 'execa'
import waitFor from 'p-wait-for'
import { satisfies } from 'semver'

// 1 second
const SERVER_KILL_TIMEOUT = 1e3

// 1 second
const SERVER_POLL_INTERNAL = 1e3

// 30 seconds - CI environments may need more time for server startup
const SERVER_POLL_TIMEOUT = 3e4

interface SuccessRef {
  success: boolean
}

const isServerReady = async (port: number, successRef: SuccessRef, ps?: ExecaChildProcess<string>) => {
  // If the process has been killed or if it exited with an error, we return
  // early with `success: false`.
  if (ps?.killed || (ps?.exitCode && ps.exitCode > 0)) {
    return true
  }

  try {
    await fetch(`http://127.0.0.1:${port}`)

    successRef.success = true
  } catch {
    return false
  }

  return true
}

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
  const successRef: SuccessRef = {
    success: false,
  }

  await waitFor(() => isServerReady(port, successRef, ps), {
    interval: SERVER_POLL_INTERNAL,
    timeout: SERVER_POLL_TIMEOUT,
  })

  return successRef.success
}

export { killProcess, waitForServer }
