const { cwd } = require('process')

const { cacheArtifacts } = require('./main')

const cachePlugin = {
  name: '@netlify/plugin-cache-core',
  async saveCache({ constants: { CACHE_DIR } }) {
    await cacheArtifacts(cwd(), CACHE_DIR)
  },
}

module.exports = cachePlugin
