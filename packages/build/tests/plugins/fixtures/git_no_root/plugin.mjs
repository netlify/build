export default {
  onPreBuild({ utils: { git } }) {
    console.log(git.modifiedFiles)
  },
}
