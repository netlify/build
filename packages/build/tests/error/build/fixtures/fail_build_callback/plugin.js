const { nextTick } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onInit({
    utils: {
      build: { failBuild },
    },
  }) {
    nextTick(() => {
      failBuild('test')
    })
    await pSetTimeout(0)
  },
}
