module.exports = {
  onPreBuild({ utils: { git } }) {
    console.log(git.modifiedFiles)
  },
}
