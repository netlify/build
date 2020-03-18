module.exports = {
  onInit({ utils: { git } }) {
    console.log(git.modifiedFiles)
  },
}
