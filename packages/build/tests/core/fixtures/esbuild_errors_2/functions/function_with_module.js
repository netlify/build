'use strict'

const mod1 = require('@org/another-test')
const mod2 = require('test')

module.exports = mod1('netlify') + mod2('netlify')
