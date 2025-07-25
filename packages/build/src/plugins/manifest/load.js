import { promises as fs } from 'fs'

import { parse } from 'yaml'

import { addErrorInfo } from '../../error/info.js'

import { validateManifest } from './validate.js'

// Load "manifest.yml" using its file path
export const loadManifest = async function ({ manifestPath, packageName, pluginPackageJson, loadedFrom, origin }) {
  try {
    const rawManifest = await loadRawManifest(manifestPath)
    const manifest = parseManifest(rawManifest)
    validateManifest(manifest, rawManifest)
    return manifest
  } catch (error) {
    addErrorInfo(error, {
      type: 'pluginValidation',
      plugin: { packageName, pluginPackageJson },
      location: { event: 'load', packageName, loadedFrom, origin },
    })
    throw error
  }
}

const loadRawManifest = async function (manifestPath) {
  try {
    return await fs.readFile(manifestPath, 'utf8')
  } catch (error) {
    error.message = `Could not load plugin's "manifest.yml"\n${error.message}`
    throw error
  }
}

const parseManifest = function (rawManifest) {
  try {
    return parse(rawManifest, { logLevel: 'error' })
  } catch (error) {
    throw new Error(`Could not parse plugin's "manifest.yml"\n${error.message}`)
  }
}
