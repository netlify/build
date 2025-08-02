import { nextTick } from 'process'
import { setTimeout } from 'timers/promises'

export const onPreBuild = async function ({
  utils: {
    build: { failPlugin },
  },
}) {
  nextTick(() => {
    failPlugin('test')
  })
  await setTimeout(0)
}
