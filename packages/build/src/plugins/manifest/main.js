const { reportPluginLoadError } = require('../../status/report')

const { checkInputs } = require('./check')
const { loadManifest } = require('./load')
const { getManifestPath } = require('./path')

// Load plugin's `manifest.yml`
const useManifest = async function(
  { package, loadedFrom, origin, inputs },
  { pluginDir, packageDir, packageJson, packageJson: { version }, mode, api, netlifyConfig, errorMonitor },
) {
  const manifestPath = await getManifestPath(pluginDir, packageDir)

  try {
    const manifest = await loadManifest({ manifestPath, package, packageJson, loadedFrom, origin })
    const inputsA = checkInputs({ inputs, manifest, package, packageJson, loadedFrom, origin })
    return { manifest, inputs: inputsA }
  } catch (error) {
    await reportPluginLoadError({ error, api, mode, event: 'load', package, version, netlifyConfig, errorMonitor })
    throw error
  }
}

module.exports = { useManifest }
