const { promisify } = require('util')

const pTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    Promise.reject('test')
    await pTimeout(0)
  },
}
