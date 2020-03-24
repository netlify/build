const {
  argv: [, , command, options],
} = require('process')

const run = require('../..')

const optionsA = options === undefined ? options : JSON.parse(options)
run.command(command, optionsA)
