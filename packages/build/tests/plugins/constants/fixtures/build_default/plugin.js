module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { BUILD_DIR } }) {
    console.log(BUILD_DIR)
  },
}
