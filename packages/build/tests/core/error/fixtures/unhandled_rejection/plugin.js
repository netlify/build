const { promisify } = require('util')

const pTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    Promise.reject('test')
    await pTimeout(0)
  },
}
