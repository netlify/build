'use strict'

const { emitWarning } = require('process')
const { promisify } = require('util')

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// 1 second
const WARNING_TIMEOUT = 1e3

module.exports = {
  async onPreBuild() {
    emitWarning('test')
    console.log('onPreBuild')
    await pSetTimeout(WARNING_TIMEOUT)
  },
}
