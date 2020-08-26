const { addPluginLoadErrorStatus } = require('../../status/add')

const { checkInputs } = require('./check')
const { loadManifest } = require('./load')
const { getManifestPath } = require('./path')

// Load plugin's `manifest.yml`
const useManifest = async function(
  { package, loadedFrom, origin, inputs },
  { pluginDir, packageDir, pluginPackageJson, pluginPackageJson: { version }, debug },
) {
  const manifestPath = await getManifestPath(pluginDir, packageDir)

  try {
    const manifest = await loadManifest({ manifestPath, package, pluginPackageJson, loadedFrom, origin })
    const inputsA = checkInputs({ inputs, manifest, package, pluginPackageJson, loadedFrom, origin })
    return inputsA
  } catch (error) {
    const errorA = addPluginLoadErrorStatus({ error, package, version, debug })
    throw errorA
  }
}

module.exports = { useManifest }
