import { nextTick } from 'process'
import { setTimeout as pSetTimeout } from 'timers/promises'

export const onPreBuild = async function ({
  utils: {
    build: { failPlugin },
  },
}) {
  nextTick(() => {
    failPlugin('test')
  })
  await pSetTimeout(0)
}
