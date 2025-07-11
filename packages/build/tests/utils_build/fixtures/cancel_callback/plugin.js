import { nextTick } from 'process'
import { setTimeout as pSetTimeout } from 'timers/promises'

export const onPreBuild = async function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  nextTick(() => {
    cancelBuild('test')
  })
  await pSetTimeout(0)
}
