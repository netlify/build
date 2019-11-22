module.exports = {
  name: 'netlify-plugin-test',
  init({ constants: { BUILD_DIR } }) {
    console.log(BUILD_DIR)
  },
}
