const { resolve } = require('path')

const { get, set, delete: deleteProp } = require('dot-prop')
const pathExists = require('path-exists')
const makeDir = require('make-dir')

const handleFiles = async function(config, baseDir) {
  const files = await Promise.all(FILES.map(file => handleFile(config, baseDir, file)))
  return files.reduce(setProp, config)
}

const FILES = [
  { location: 'build.publish', defaultPath: '.netlify/build/' },
  { location: 'build.functions', defaultPath: 'functions/', defaultIfExists: true },
]

const handleFile = async function(config, baseDir, { location, defaultPath, defaultIfExists = false }) {
  const path = get(config, location)

  const pathA = await addDefault({ path, baseDir, defaultPath, defaultIfExists })
  const pathB = normalizePath(pathA, baseDir)
  await ensurePath(pathB, location)

  return { location, path: pathB }
}

const addDefault = async function({ path, baseDir, defaultPath, defaultIfExists }) {
  if (path !== undefined || defaultPath === undefined) {
    return path
  }

  const defaultPathA = resolve(baseDir, defaultPath)

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

const ensurePath = async function(path, location) {
  if (path === undefined || (await pathExists(path))) {
    return
  }

  await makeDir(path)
}

const setProp = function(config, { location, path }) {
  if (path === undefined) {
    deleteProp(config, location)
  } else {
    set(config, location, path)
  }

  return config
}

module.exports = { handleFiles }
