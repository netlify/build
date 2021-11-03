'use strict'

module.exports = {
  onPreBuild() {
    const error = new TypeError('message')
    error.staticProperty = true
    delete error.message
    delete error.stack
    throw error
  },
}
