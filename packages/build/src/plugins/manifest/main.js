const { reportPluginLoadError } = require('../../status/report')

const { checkInputs } = require('./check')
const { loadManifest } = require('./load')
const { getManifestPath } = require('./path')

// Load plugin's `manifest.yml`
const useManifest = async function(
  { package, loadedFrom, origin, inputs },
  {
    pluginDir,
    packageDir,
    pluginPackageJson,
    pluginPackageJson: { version },
    mode,
    api,
    netlifyConfig,
    errorMonitor,
    deployId,
    logs,
    testOpts,
  },
) {
  const manifestPath = await getManifestPath(pluginDir, packageDir)

  try {
    const manifest = await loadManifest({ manifestPath, package, pluginPackageJson, loadedFrom, origin })
    const inputsA = checkInputs({ inputs, manifest, package, pluginPackageJson, loadedFrom, origin })
    return inputsA
  } catch (error) {
    await reportPluginLoadError({
      error,
      api,
      mode,
      event: 'load',
      package,
      version,
      netlifyConfig,
      errorMonitor,
      deployId,
      logs,
      testOpts,
    })
    throw error
  }
}

module.exports = { useManifest }
