const pluginDecrypt = require('./pluginDecrypt')

function encryptedFilesPlugin(conf) {
  return {
    // scopes: ['listSites'],
    // Hook into lifecycle
    init: () => {
      console.log('decrypting files')
      pluginDecrypt()
    },
  }
}

module.exports = encryptedFilesPlugin
