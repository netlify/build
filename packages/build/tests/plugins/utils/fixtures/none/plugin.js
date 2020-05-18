module.exports = {
  onPreBuild({ utils }) {
    console.log(
      Object.keys(utils)
        .sort()
        .join(' '),
    )
  },
}
