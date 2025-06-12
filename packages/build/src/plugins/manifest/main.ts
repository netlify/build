import { type PackageJson } from 'read-package-up'

import { addPluginLoadErrorStatus } from '../../status/load_error.js'

import { checkInputs } from './check.js'
import { loadManifest } from './load.js'
import { getManifestPath } from './path.js'

/**
 * Load plugin's `manifest.yml`
 */
export const useManifest = async function (
  {
    packageName,
    loadedFrom,
    origin,
    inputs,
  }: { packageName: string; loadedFrom?: unknown; origin?: unknown; inputs?: unknown },
  {
    pluginDir,
    packageDir,
    pluginPackageJson,
    pluginPackageJson: { version },
    debug,
  }: {
    pluginDir: string
    packageDir?: string
    pluginPackageJson: PackageJson
    debug: boolean
  },
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
