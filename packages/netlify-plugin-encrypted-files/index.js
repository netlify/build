const pluginDecrypt = require('./pluginDecrypt')

module.exports = {
  name: '@netlify/plugin-encrypted-files',
  // scopes: ['listSites'],
  init() {
    console.log('decrypting files')
    pluginDecrypt()
  },
}
