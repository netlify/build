module.exports = {
  name: 'netlify-plugin-test',
  onInit({ utils: { run } }) {
    console.log(
      Object.keys(run)
        .sort()
        .join(' '),
    )
  },
}
