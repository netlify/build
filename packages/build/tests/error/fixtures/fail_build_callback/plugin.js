import { nextTick } from 'process'
import { promisify } from 'util'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

export default {
  async onPreBuild({
    utils: {
      build: { failBuild },
    },
  }) {
    nextTick(() => {
      failBuild('test')
    })
    await pSetTimeout(0)
  },
}
