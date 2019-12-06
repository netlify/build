module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { CACHE_DIR } }) {
    console.log(CACHE_DIR)
  },
}
