'use strict'

const { promisify } = require('util')

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onPreBuild() {
    unhandledPromise()
    console.log('onPreBuild')
    await pSetTimeout(0)
  },
}

const unhandledPromise = function () {
  return Promise.reject(new Error('test'))
}
