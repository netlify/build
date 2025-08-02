import { nextTick } from 'process'
import { setTimeout } from 'timers/promises'

export const onPreBuild = async function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  nextTick(() => {
    cancelBuild('test')
  })
  await setTimeout(0)
}
