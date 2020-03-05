const { resolve } = require('path')

// Make configuration paths relative to `baseDir`
const handleFiles = function({ build, ...config }, baseDir) {
  const buildA = PROP_NAMES.reduce((build, propName) => normalizePath(build, propName, baseDir), build)
  return { ...config, build: buildA }
}

const PROP_NAMES = ['publish', 'functions']

const normalizePath = function(build, propName, baseDir) {
  const path = build[propName]

  if (path === undefined) {
    return build
  }

  const pathA = resolve(baseDir, path)
  return { ...build, [propName]: pathA }
}

module.exports = { handleFiles }
