'use strict'

const pathExists = require('path-exists')

// Some `constants` have a default value when a specific file exists.
// Those default values are assigned by `@netlify/config`. However, the build
// command or plugins might create those specific files, in which case, the
// related `constant` should be updated, unless the user has explicitly
// configured it.
const getConstants = async function ({ constants, buildDir }) {
  const newConstants = await Promise.all(
    DEFAULT_PATHS.map(({ constantName, defaultPath }) =>
      addDefaultConstant({ constants, constantName, defaultPath, buildDir }),
    ),
  )
  return Object.assign({}, constants, ...newConstants)
}

// The current directory is the build directory, which is correct, so we don't
// need to resolve paths
const DEFAULT_PATHS = [
  { constantName: 'FUNCTIONS_SRC', defaultPath: 'netlify-automatic-functions' },
  { constantName: 'EDGE_HANDLERS_SRC', defaultPath: 'edge-handlers' },
]

const addDefaultConstant = async function ({ constants, constantName, defaultPath, buildDir }) {
  // Configuration paths are relative to the build directory.
  if (constants[constantName] !== undefined || !(await pathExists(`${buildDir}/${defaultPath}`))) {
    return {}
  }

  // However, the plugin child process' current directory is the build directory,
  // so we can pass the relative path instead of the resolved absolute path.
  return { [constantName]: defaultPath }
}

module.exports = { getConstants }
