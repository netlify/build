module.exports = {
  name: 'netlify-plugin-test',
  onInit({ utils: { cache } }) {
    console.log(Object.keys(cache))
  },
}
