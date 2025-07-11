import { emitWarning } from 'process'
import { setTimeout as pSetTimeout } from 'timers/promises'

// 1 second
const WARNING_TIMEOUT = 1e3

export const onPreBuild = async function () {
  emitWarning('test')
  console.log('onPreBuild')
  await pSetTimeout(WARNING_TIMEOUT)
}
