'use strict'

const { promisify } = require('util')

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
