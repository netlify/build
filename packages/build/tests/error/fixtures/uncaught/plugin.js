import { setTimeout as pSetTimeout } from 'timers/promises'

export const onPreBuild = async function () {
  setTimeout(function callback() {
    throw new Error('test')
  }, 0)
  await pSetTimeout(0)
}
