const { checkInputs } = require('./check')
const { loadManifest } = require('./load')
const { getManifestPath } = require('./path')

// Load plugin's `manifest.yml`
const useManifest = async function({ package, local, inputs }, { pluginDir, packageDir, packageJson }) {
  const manifestPath = await getManifestPath(pluginDir, packageDir)

  if (manifestPath === undefined) {
    return { manifest: {}, inputs }
  }

  const manifest = await loadManifest({ manifestPath, package, packageJson, local })
  const inputsA = checkInputs({ inputs, manifest, package, packageJson, local })
  return { manifest, inputs: inputsA }
}

module.exports = { useManifest }
