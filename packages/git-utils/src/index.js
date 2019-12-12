const { LocalGit } = require('./LocalGit')

module.exports = async function gitErDone(opts) {
  const localPlatform = new LocalGit(opts)
  const git = await localPlatform.getPlatformGitRepresentation()
  return git
}
