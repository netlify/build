'use strict'

const body = require('does_not_exist')

module.exports.handler = function handler() {
  return { statusCode: 200, body }
}
