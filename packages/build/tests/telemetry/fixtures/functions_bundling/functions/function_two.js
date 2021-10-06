'use strict'

const nativeModule = require('native-module')

const { one } = require('./lib/util')

module.exports = () => [one, nativeModule]
