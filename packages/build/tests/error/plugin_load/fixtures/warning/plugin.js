const { emitWarning } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    emitWarning('test')
    console.log('onInit')
    await pSetTimeout(1e3)
  },
}
