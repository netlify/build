export const onPreBuild = function ({ utils: { git } }) {
  console.log(git.modifiedFiles)
}
