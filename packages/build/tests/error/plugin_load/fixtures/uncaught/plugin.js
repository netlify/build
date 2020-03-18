const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onInit() {
    setTimeout(function callback() {
      throw new Error('test')
    }, 0)
    await pSetTimeout(0)
  },
}
