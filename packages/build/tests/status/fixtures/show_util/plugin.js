'use strict'

const { env } = require('process')

const showArg = env.SHOW_ARG === '""' ? undefined : JSON.parse(env.SHOW_ARG)

module.exports = {
  onPreBuild({
    utils: {
      status: { show },
    },
  }) {
    show(showArg)
  },
}
