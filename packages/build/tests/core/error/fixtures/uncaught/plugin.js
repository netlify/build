const { promisify } = require('util')

const pTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    setTimeout(function callback() {
      throw new Error('test')
    }, 0)
    await pTimeout(0)
  },
}
