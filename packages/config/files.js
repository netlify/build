const { resolve } = require('path')

const { get, set, delete: deleteProp } = require('dot-prop')
const pathExists = require('path-exists')

const handleFiles = async function(config, baseDir) {
  const files = await Promise.all(FILES.map(file => handleFile(config, baseDir, file)))
  return files.reduce(setProp, config)
}

const FILES = [
  { path: 'build.publish', defaultValue: '.netlify/build/' },
  { path: 'build.functions', defaultValue: 'functions/', defaultIfExists: true },
]

const handleFile = async function(config, baseDir, { path, defaultValue, defaultIfExists = false }) {
  const value = get(config, path)

  const valueA = await addDefault({ value, baseDir, defaultValue, defaultIfExists })
  const valueB = normalizePath(valueA, baseDir)

  return { path, value: valueB }
}

const addDefault = async function({ value, baseDir, defaultValue, defaultIfExists }) {
  if (value !== undefined || defaultValue === undefined) {
    return value
  }

  const defaultValueA = resolve(baseDir, defaultValue)
  if (defaultIfExists && !(await pathExists(defaultValueA))) {
    return value
  }

  return defaultValueA
}

// Resolve paths relatively to the config file.
// Also normalize paths to OS-specific path delimiters.
const normalizePath = function(value, baseDir) {
  if (value === undefined) {
    return value
  }

  return resolve(baseDir, value)
}

const setProp = function(config, { path, value }) {
  if (value === undefined) {
    deleteProp(config, path)
  } else {
    set(config, path, value)
  }

  return config
}

module.exports = { handleFiles }
