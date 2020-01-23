const micromatch = require('micromatch')
const mapObj = require('map-obj')

// Return functions that return modified|created|deleted files filtered by a
// globbing pattern
const fileMatch = function({ modifiedFiles, createdFiles, deletedFiles }, ...patterns) {
  const matchFiles = {
    modified: modifiedFiles,
    created: createdFiles,
    deleted: deletedFiles,
    edited: [...modifiedFiles, ...createdFiles],
  }
  return mapObj(matchFiles, (key, paths) => [key, micromatch(paths, patterns)])
}

module.exports = { fileMatch }
