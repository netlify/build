module.exports = {
  onPreBuild({ utils: { git } }) {
    console.log(
      Object.keys(git)
        .sort()
        .join(' '),
    )
  },
}
