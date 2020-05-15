const { reportPluginLoadError } = require('../../status/report')

const { checkInputs } = require('./check')
const { loadManifest } = require('./load')
const { getManifestPath } = require('./path')

// Load plugin's `manifest.yml`
const useManifest = async function(
  { package, loadedFrom, inputs },
  { pluginDir, packageDir, packageJson, packageJson: { version }, mode, api },
) {
  const manifestPath = await getManifestPath(pluginDir, packageDir)

  if (manifestPath === undefined) {
    return { manifest: {}, inputs }
  }

  try {
    const manifest = await loadManifest({ manifestPath, package, packageJson, loadedFrom })
    const inputsA = checkInputs({ inputs, manifest, package, packageJson, loadedFrom })
    return { manifest, inputs: inputsA }
  } catch (error) {
    await reportPluginLoadError({ error, api, mode, event: 'load', package, version })
    throw error
  }
}

module.exports = { useManifest }
