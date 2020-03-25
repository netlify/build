module.exports = {
  onInit({ utils: { git } }) {
    console.log(
      Object.keys(git)
        .sort()
        .join(' '),
    )
  },
}
