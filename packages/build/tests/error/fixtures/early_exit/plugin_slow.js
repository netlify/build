import { env, kill } from 'process'
import { setTimeout as pSetTimeout } from 'timers/promises'

import { processExists } from 'process-exists'

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
