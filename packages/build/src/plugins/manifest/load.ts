import { promises as fs } from 'fs'

import type { PackageJson } from 'read-package-up'
import { parse } from 'yaml'

import { addErrorInfo } from '../../error/info.js'

import { validateManifest, type PluginManifest } from './validate.js'

// Load "manifest.yml" using its file path
export const loadManifest = async function ({
  manifestPath,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
}: {
  manifestPath: string
  packageName: string
  pluginPackageJson: PackageJson
  loadedFrom: string | undefined
  origin: string | undefined
}): Promise<PluginManifest> {
  try {
    const rawManifest = await loadRawManifest(manifestPath)
    const manifest = parseManifest(rawManifest)
    validateManifest(manifest, rawManifest)
    // Parsed YAML whose shape `validateManifest()` just checked
    return manifest as PluginManifest
  } catch (error) {
    addErrorInfo(error, {
      type: 'pluginValidation',
      plugin: { packageName, pluginPackageJson },
      location: { event: 'load', packageName, loadedFrom, origin },
    })
    throw error
  }
}

const loadRawManifest = async function (manifestPath: string): Promise<string> {
  try {
    return await fs.readFile(manifestPath, 'utf8')
  } catch (error) {
    // `fs.readFile()` only rejects with `Error` instances
    if (error instanceof Error) {
      error.message = `Could not load plugin's "manifest.yml"\n${error.message}`
    }
    throw error
  }
}

const parseManifest = function (rawManifest: string): unknown {
  try {
    return parse(rawManifest, { logLevel: 'error' })
  } catch (error) {
    // `yaml` only throws `Error` instances
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Could not parse plugin's "manifest.yml"\n${message}`)
  }
}
