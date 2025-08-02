import { setTimeout as setTimeoutPromise } from 'timers/promises'

export const onPreBuild = async function () {
  setTimeout(function callback() {
    throw new Error('test')
  }, 0)
  await setTimeoutPromise(0)
}
