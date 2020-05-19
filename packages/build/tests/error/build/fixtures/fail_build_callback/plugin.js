const { nextTick } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

module.exports = {
  async onPreBuild({
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
