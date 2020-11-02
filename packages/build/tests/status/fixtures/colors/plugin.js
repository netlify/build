'use strict'

const { red } = require('chalk')

module.exports = {
  onBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: red('summary') })
  },
}
