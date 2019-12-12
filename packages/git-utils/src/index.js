const { LocalGit } = require('./localGit')

module.exports = async function gitErDone(opts) {
  const localPlatform = new LocalGit(opts)
  const git = await localPlatform.getPlatformGitRepresentation()
  return git
}
