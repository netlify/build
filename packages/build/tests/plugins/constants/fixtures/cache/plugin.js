module.exports = {
  name: 'netlify-plugin-test',
  init({ constants: { CACHE_DIR } }) {
    console.log(CACHE_DIR)
  },
}
