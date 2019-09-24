const installGrunt = require('./node/grunt')

module.exports = async function installMissingCommands(cwd, cacheDir, buildCommand) {
  /* Install grunt if in build command but missing on machine */
  await installGrunt(cwd, buildCommand)
}
