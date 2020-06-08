module.exports = {
  onPreBuild({ utils: { cache } }) {
    console.log(
      Object.keys(cache)
        .sort()
        .join(' '),
    )
  },
}
