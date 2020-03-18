module.exports = {
  onInit({ utils: { run } }) {
    console.log(
      Object.keys(run)
        .sort()
        .join(' '),
    )
  },
}
