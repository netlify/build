const { resolve } = require('path')

const { get, set, delete: deleteProp } = require('dot-prop')

// Normalize and validate configuration properties that refer to directories
const handleFiles = function(config, baseDir) {
  const files = FILES.map(location => handleFile(config, baseDir, location))
  return files.reduce(setProp, config)
}

// List of configuration properties that refer to directories
const FILES = ['build.publish', 'build.functions']

const handleFile = function(config, baseDir, location) {
  const path = get(config, location)
  const pathA = normalizePath(path, baseDir)
  return { location, path: pathA }
}

// Resolve paths relatively to the config file.
// Also normalize paths to OS-specific path delimiters.
const normalizePath = function(path, baseDir) {
  if (path === undefined) {
    return path
  }

  return resolve(baseDir, path)
}

// Set new value back to the configuration object
const setProp = function(config, { location, path }) {
  if (path === undefined) {
    deleteProp(config, location)
  } else {
    set(config, location, path)
  }

  return config
}

module.exports = { handleFiles }
