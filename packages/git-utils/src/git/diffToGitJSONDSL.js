const parseDiff = require('parse-diff')
const includes = require('lodash.includes')

module.exports.diffToGitJSONDSL = (diff, commits) => {
  const fileDiffs = parseDiff(diff)
  const addedDiffs = fileDiffs.filter(diff => diff['new'])
  const removedDiffs = fileDiffs.filter(diff => diff['deleted'])
  const modifiedDiffs = fileDiffs.filter(
    diff => !includes(addedDiffs, diff) && !includes(removedDiffs, diff)
  )
  return {
    modified_files: modifiedDiffs.map(
      d => d.to || (d.from && d.from.split(' b/')[0])
    ),
    created_files: addedDiffs.map(d => d.to),
    deleted_files: removedDiffs.map(d => d.from),
    commits: commits
  }
}
