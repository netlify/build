'use strict'

const veryLargeFile = require('../../veryLargeFile')

module.exports.handler = () => ({
  body: veryLargeFile,
})
