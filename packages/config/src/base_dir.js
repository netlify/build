const { resolve } = require('path')

// Retrieve the base directory used to resolve most paths.
// This is (in priority order):
//  - `build.base`
//  - `--repositoryRoot`
//  - the current directory
const getBaseDir = function(repositoryRoot, { build: { base = repositoryRoot } }) {
  return resolve(repositoryRoot, base)
}

module.exports = { getBaseDir }
