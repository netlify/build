const { cwd } = require('process')

const { cacheArtifacts } = require('./main')

// Save/restore cache core plugin
const cachePlugin = {
  name: '@netlify/plugin-cache-core',
  async onSaveCache() {
    await cacheArtifacts(cwd())
  },
}

module.exports = cachePlugin
