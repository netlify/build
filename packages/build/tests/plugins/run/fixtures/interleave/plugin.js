const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onInit() {
    console.log('one')
    await pSetTimeout(1e3)
    console.error('two')
    await pSetTimeout(1e3)
    console.log('three')
  },
}
