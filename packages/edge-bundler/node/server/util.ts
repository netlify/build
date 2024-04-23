import { ExecaChildProcess } from 'execa'
import fetch from 'node-fetch'
import waitFor from 'p-wait-for'

// 1 second
const SERVER_KILL_TIMEOUT = 1e3

// 1 second
const SERVER_POLL_INTERNAL = 1e3

// 10 seconds
const SERVER_POLL_TIMEOUT = 1e4

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

    ps.kill('SIGTERM', {
      forceKillAfterTimeout: SERVER_KILL_TIMEOUT,
    })
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
