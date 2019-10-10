const pluginDecrypt = require('./pluginDecrypt')

module.exports = {
  // scopes: ['listSites'],
  init() {
    console.log('decrypting files')
    pluginDecrypt()
  }
}
