const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  name: 'netlify-plugin-test',
  async onBuild() {
    console.log('onBuild start')
    await pSetTimeout(1e3)
    console.log('onBuild end')
  },
}
