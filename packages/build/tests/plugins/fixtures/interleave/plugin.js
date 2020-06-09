const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onPreBuild() {
    console.log('one')
    await pSetTimeout(1e2)
    console.error('two')
    await pSetTimeout(1e2)
    console.log('three')
  },
}
