const { resolve } = require('path')

// Make configuration paths relative to `buildDir`
const handleFiles = function({ build, ...config }, buildDir) {
  const buildA = PROP_NAMES.reduce((build, propName) => normalizePath(build, propName, buildDir), build)
  return { ...config, build: buildA }
}

const PROP_NAMES = ['publish', 'functions']

const normalizePath = function(build, propName, buildDir) {
  const path = build[propName]

  if (path === undefined) {
    return build
  }

  const pathA = resolve(buildDir, path)
  return { ...build, [propName]: pathA }
}

module.exports = { handleFiles }
