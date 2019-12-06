const { cwd } = require('process')

const { cacheArtifacts } = require('./main')

// Save/restore cache core plugin
const cachePlugin = {
  name: '@netlify/plugin-cache-core',
  async onSaveCache({ constants: { CACHE_DIR } }) {
    await cacheArtifacts(cwd(), CACHE_DIR)
  },
}

module.exports = cachePlugin
