'use strict'

const locatePath = require('locate-path')

const { addErrorInfo } = require('../../error/info')

// Retrieve "manifest.yml" path for a specific plugin
const getManifestPath = async function ({ pluginDir, packageDir, packageName }) {
  const dirs = [pluginDir, packageDir]
    .filter(Boolean)
    .flatMap((dir) => MANIFEST_FILENAMES.map((filename) => `${dir}/${filename}`))
  const manifestPath = await locatePath(dirs)
  validateManifestExists(manifestPath, packageName)
  return manifestPath
}

const validateManifestExists = function (manifestPath, packageName) {
  if (manifestPath !== undefined) {
    return
  }

  const error = new Error(
    `The plugin "${packageName}" is missing a "manifest.yml".
This might mean:
  - The plugin "package" name is misspelled
  - The plugin "package" points to a Node module that is not a Netlify Build plugin
  - If you're developing a plugin, please see the documentation at https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#anatomy-of-a-plugin`,
  )
  addErrorInfo(error, { type: 'resolveConfig' })
  throw error
}

const MANIFEST_FILENAMES = ['manifest.yml', 'manifest.yaml']

module.exports = { getManifestPath }
