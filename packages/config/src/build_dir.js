const { resolve } = require('path')

// Retrieve the build directory used to resolve most paths.
// This is (in priority order):
//  - `build.base`
//  - `--repositoryRoot`
//  - the current directory
const getBuildDir = function(repositoryRoot, { build: { base = repositoryRoot } }) {
  return resolve(repositoryRoot, base)
}

module.exports = { getBuildDir }
