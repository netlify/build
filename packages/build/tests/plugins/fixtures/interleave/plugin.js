import { setTimeout } from 'timers/promises'

// 100ms
const LOG_TIMEOUT = 1e2

export const onPreBuild = async function () {
  console.log('one')
  await setTimeout(LOG_TIMEOUT)
  console.error('two')
  await setTimeout(LOG_TIMEOUT)
  console.log('three')
}
