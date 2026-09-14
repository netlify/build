import micromatch from 'micromatch'

// Return functions that return modified|created|deleted files filtered by a
// globbing pattern
export const fileMatch = function ({ modifiedFiles, createdFiles, deletedFiles }, ...patterns) {
  const matchFiles = {
    modified: modifiedFiles,
    created: createdFiles,
    deleted: deletedFiles,
    edited: [...modifiedFiles, ...createdFiles],
  }
  return Object.fromEntries(Object.entries(matchFiles).map(([key, paths]) => [key, micromatch(paths, patterns)]))
}
