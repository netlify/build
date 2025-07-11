import { setTimeout as pSetTimeout } from 'timers/promises'

// 100ms
const LOG_TIMEOUT = 1e2

export const onPreBuild = async function () {
  console.log('one')
  await pSetTimeout(LOG_TIMEOUT)
  console.error('two')
  await pSetTimeout(LOG_TIMEOUT)
  console.log('three')
}
