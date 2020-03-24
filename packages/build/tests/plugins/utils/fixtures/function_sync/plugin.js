module.exports = {
  onInit({ utils: { cache } }) {
    console.log(
      Object.keys(cache)
        .sort()
        .join(' '),
    )
  },
}
