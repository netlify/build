'use strict'

const { env } = require('process')

console.log('Contains TEST environment variable', 'TEST' in env)
