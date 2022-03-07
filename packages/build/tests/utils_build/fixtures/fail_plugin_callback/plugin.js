import { nextTick } from 'process'
import { promisify } from 'util'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

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
