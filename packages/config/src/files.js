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
const FILES = [
  { location: 'build.publish', defaultPath: '.netlify/build/' },
  { location: 'build.functions', defaultPath: 'functions/', defaultIfExists: true },
]

const handleFile = async function(config, baseDir, { location, defaultPath, defaultIfExists = false }) {
  const path = get(config, location)

  const pathA = await addDefault({ path, baseDir, defaultPath, defaultIfExists })
  const pathB = normalizePath(pathA, baseDir)
  await ensurePath(pathB)

  return { location, path: pathB }
}

// Add default value
const addDefault = async function({ path, baseDir, defaultPath, defaultIfExists }) {
  if (path !== undefined || defaultPath === undefined) {
    return path
  }

  const defaultPathA = resolve(baseDir, defaultPath)

  // When `defaultIfExists: true`, only assign default value if it points to
  // a directory that already exists
  if (defaultIfExists && !(await pathExists(defaultPathA))) {
    return path
  }

  return defaultPathA
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
