const detectProjectSettings = require('./detect-project')
const detectFunctionsBuilder = require('./detect-functions-builder')
const detectGitRepo = require('./detect-git-repo')
const getHeuristics = require('./get-heuristics')

module.exports = {
  detectProjectSettings,
  detectFunctionsBuilder,
  detectGitRepo,
  getHeuristics,
}
