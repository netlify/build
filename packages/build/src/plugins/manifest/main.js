'use strict'

const { addPluginLoadErrorStatus } = require('../../status/load_error')

const { checkInputs } = require('./check')
const { loadManifest } = require('./load')
const { getManifestPath } = require('./path')

// Load plugin's `manifest.yml`
const useManifest = async function (
  { packageName, loadedFrom, origin, inputs },
  { pluginDir, packageDir, pluginPackageJson, pluginPackageJson: { version }, debug },
) {
  const manifestPath = await getManifestPath({ pluginDir, packageDir, packageName })

  try {
    const manifest = await loadManifest({ manifestPath, packageName, pluginPackageJson, loadedFrom, origin })
    const inputsA = checkInputs({ inputs, manifest, packageName, pluginPackageJson, loadedFrom, origin })
    return { manifest, inputs: inputsA }
  } catch (error) {
    addPluginLoadErrorStatus({ error, packageName, version, debug })
    throw error
  }
}

module.exports = { useManifest }
