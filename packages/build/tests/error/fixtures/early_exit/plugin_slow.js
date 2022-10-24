import { env, kill } from 'process'
import { promisify } from 'util'

import { processExists } from 'process-exists'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// 100ms
const PROCESS_TIMEOUT = 1e2

export const onBuild = async function () {
  kill(env.TEST_PID)

  // Signals are async, so we need to wait for the child process to exit
  // The while loop is required due to `await`
  while (await processExists(env.TEST_PID)) {
    await pSetTimeout(PROCESS_TIMEOUT)
  }
}
