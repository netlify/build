const { readFile } = require('fs')
const { promisify } = require('util')

const { load: loadYaml, JSON_SCHEMA } = require('js-yaml')

const { addErrorInfo } = require('../../error/info')

const { validateManifest } = require('./validate')

const pReadFile = promisify(readFile)

// Load "manifest.yml" using its file path
const loadManifest = async function({ manifestPath, package, packageJson, local }) {
  try {
    const rawManifest = await loadRawManifest(manifestPath)
    const manifest = await parseManifest(rawManifest)
    validateManifest(manifest, rawManifest)
    return manifest
  } catch (error) {
    addErrorInfo(error, {
      type: 'pluginValidation',
      plugin: { package, packageJson },
      location: { event: 'load', package, local },
    })
    throw error
  }
}

const loadRawManifest = async function(manifestPath) {
  try {
    return await pReadFile(manifestPath, 'utf8')
  } catch (error) {
    error.message = `Could not load plugin's "manifest.yml"\n${error.message}`
    throw error
  }
}

const parseManifest = async function(rawManifest) {
  try {
    return await loadYaml(rawManifest, { schema: JSON_SCHEMA, json: true })
  } catch (error) {
    error.message = `Could not parse plugin's "manifest.yml"\n${error.message}`
    throw error
  }
}

module.exports = { loadManifest }
