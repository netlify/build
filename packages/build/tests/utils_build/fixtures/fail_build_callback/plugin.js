import { nextTick } from 'process'
import { setTimeout as pSetTimeout } from 'timers/promises'

export const onPreBuild = async function ({
  utils: {
    build: { failBuild },
  },
}) {
  nextTick(() => {
    failBuild('test')
  })
  await pSetTimeout(0)
}
