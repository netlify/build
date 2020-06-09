const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onPreBuild() {
    unhandledPromise()
    console.log('onPreBuild')
    await pSetTimeout(0)
  },
}

const unhandledPromise = async function() {
  throw new Error('test')
}
