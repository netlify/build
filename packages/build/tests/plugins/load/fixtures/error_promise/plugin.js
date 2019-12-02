const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    unhandledPromise()
    console.log('init')
    await pSetTimeout(0)
  },
}

const unhandledPromise = async function() {
  throw new Error('test')
}
