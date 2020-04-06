const { nextTick } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onInit({
    utils: {
      build: { failPlugin },
    },
  }) {
    nextTick(() => {
      failPlugin('test')
    })
    await pSetTimeout(0)
  },
}
