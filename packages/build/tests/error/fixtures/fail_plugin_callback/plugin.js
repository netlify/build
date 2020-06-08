const { nextTick } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onPreBuild({
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
