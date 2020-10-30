'use strict'

module.exports = {
  onBuild() {
    console.log('test')
    const error = new Error('test')
    error.name = 'TestError'
    throw error
  },
  onError({ error: { name, message, stack } }) {
    console.log(name)
    console.log(message)
    console.log(stack)
  },
}
