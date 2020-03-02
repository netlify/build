const { resolve } = require('path')

const { get, set, delete: deleteProp } = require('dot-prop')
const pathExists = require('path-exists')
const makeDir = require('make-dir')

// Normalize and validate configuration properties that refer to directories
const handleFiles = async function(config, baseDir) {
  const files = await Promise.all(FILES.map(file => handleFile(config, baseDir, file)))
  return files.reduce(setProp, config)
}

// List of configuration properties that refer to directories
const FILES = [{ location: 'build.publish', defaultPath: baseDir => baseDir }, { location: 'build.functions' }]

const handleFile = async function(config, baseDir, { location, defaultPath }) {
  const path = get(config, location)

  const pathA = addDefault({ path, baseDir, defaultPath })
  const pathB = normalizePath(pathA, baseDir)
  await ensurePath(pathB)

  return { location, path: pathB }
}

// Add default value
const addDefault = function({ path, baseDir, defaultPath }) {
  if (path !== undefined || defaultPath === undefined) {
    return path
  }

  const defaultPathA = typeof defaultPath === 'function' ? defaultPath(baseDir) : defaultPath
  const defaultPathB = resolve(baseDir, defaultPathA)
  return defaultPathB
}

// Resolve paths relatively to the config file.
// Also normalize paths to OS-specific path delimiters.
const normalizePath = function(path, baseDir) {
  if (path === undefined) {
    return path
  }

  return resolve(baseDir, path)
}

// Create directory if it does not already exists
const ensurePath = async function(path) {
  if (path === undefined || (await pathExists(path))) {
    return
  }

  await makeDir(path)
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
