const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    unhandledPromise()
    console.log('onInit')
    await pSetTimeout(0)
  },
}

const unhandledPromise = async function() {
  throw new Error('test')
}
