import { promisify } from 'util'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

export default {
  async onPreBuild() {
    setTimeout(function callback() {
      throw new Error('test')
    }, 0)
    await pSetTimeout(0)
  },
}
