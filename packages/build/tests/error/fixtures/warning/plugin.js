import { emitWarning } from 'process'
import { promisify } from 'util'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// 1 second
const WARNING_TIMEOUT = 1e3

export default {
  async onPreBuild() {
    emitWarning('test')
    console.log('onPreBuild')
    await pSetTimeout(WARNING_TIMEOUT)
  },
}
