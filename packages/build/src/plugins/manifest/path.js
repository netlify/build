const locatePath = require('locate-path')

// Retrieve "manifest.yml" path for a specific plugin
const getManifestPath = async function(pluginDir, packageDir) {
  const dirs = [pluginDir, packageDir].filter(Boolean).map(dir => `${dir}/${MANIFEST_FILENAME}`)
  const manifestPath = await locatePath(dirs)
  return manifestPath
}

const MANIFEST_FILENAME = 'manifest.yml'

module.exports = { getManifestPath }
