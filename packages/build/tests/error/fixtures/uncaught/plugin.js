'use strict'

const { promisify } = require('util')

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onPreBuild() {
    setTimeout(function callback() {
      throw new Error('test')
    }, 0)
    await pSetTimeout(0)
  },
}
