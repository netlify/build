const { resolve } = require('path')

const { get, set, delete: deleteProp } = require('dot-prop')

const handleFiles = function(config, baseDir) {
  return FILES.reduce(handleFile.bind(null, baseDir), config)
}

const handleFile = function(baseDir, config, { path }) {
  const value = get(config, path)

  const valueA = normalizePath(value, baseDir)

  if (valueA === undefined) {
    deleteProp(config, path)
  } else {
    set(config, path, valueA)
  }

  return config
}

// Resolve paths relatively to the config file.
// Also normalize paths to OS-specific path delimiters.
const normalizePath = function(value, baseDir) {
  if (value === undefined) {
    return value
  }

  return resolve(baseDir, value)
}

const FILES = [{ path: 'build.publish' }, { path: 'build.functions' }]

module.exports = { handleFiles }
