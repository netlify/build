module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ constants: { CACHE_DIR } }) {
    console.log(CACHE_DIR)
  },
}
