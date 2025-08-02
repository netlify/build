import { nextTick } from 'process'
import { setTimeout } from 'timers/promises'

export const onPreBuild = async function ({
  utils: {
    build: { failBuild },
  },
}) {
  nextTick(() => {
    failBuild('test')
  })
  await setTimeout(0)
}
