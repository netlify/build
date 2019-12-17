const micromatch = require('micromatch')
const mapObj = require('map-obj')

// Return functions that return modified|created|deleted files filtered by a
// globbing pattern
const getMatchers = function({ modifiedFiles, createdFiles, deletedFiles }) {
  const matchFiles = {
    modified: modifiedFiles,
    created: createdFiles,
    deleted: deletedFiles,
    edited: [...modifiedFiles, ...createdFiles],
  }
  return {
    fileMatch: fileMatch.bind(null, matchFiles),
    match: match.bind(null, matchFiles),
  }
}

// Return each list of files as a boolean (whether there is any match)
const fileMatch = function(files, ...patterns) {
  return mapObj(files, (key, paths) => [key, micromatch(paths, patterns).length !== 0])
}

// Return each list of files as an array of filepaths
const match = function(files, ...patterns) {
  return mapObj(files, (key, paths) => [key, micromatch(paths, patterns)])
}

module.exports = { getMatchers }
