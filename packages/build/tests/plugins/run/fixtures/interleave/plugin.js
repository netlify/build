const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    console.log('one')
    await pSetTimeout(1e3)
    console.error('two')
    await pSetTimeout(1e3)
    console.log('three')
  },
}
