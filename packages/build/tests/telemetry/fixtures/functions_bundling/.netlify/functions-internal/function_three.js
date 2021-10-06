'use strict'

const dynamicImportModule = require('dynamic-import-module')

module.exports = (name) => {
  return dynamicImportModule(name)
}
