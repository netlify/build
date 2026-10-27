import { env, kill } from 'process'
import { setTimeout } from 'timers/promises'

import { isRunning } from 'tinyps'

// 100ms
const PROCESS_TIMEOUT = 1e2

export const onBuild = async function () {
  kill(env.TEST_PID)

  // Signals are async, so we need to wait for the child process to exit
  // The while loop is required due to `await`
  while (isRunning(Number(env.TEST_PID))) {
    await setTimeout(PROCESS_TIMEOUT)
  }
}
