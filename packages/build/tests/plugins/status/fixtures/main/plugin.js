const { env } = require('process')

const showArg = env.SHOW_ARG === '""' ? undefined : JSON.parse(env.SHOW_ARG)

module.exports = {
  onInit({
    utils: {
      status: { show },
    },
  }) {
    show(showArg)
  },
}
