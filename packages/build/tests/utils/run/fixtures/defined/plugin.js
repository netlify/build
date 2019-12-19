module.exports = {
  name: 'netlify-plugin-test',
  onInit({ utils: { run } }) {
    console.log(
      typeof run,
      Object.keys(run)
        .sort()
        .join(' '),
    )
  },
}
