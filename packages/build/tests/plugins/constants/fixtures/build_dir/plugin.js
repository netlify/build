module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants, constants: { PUBLISH_DIR, BUILD_DIR } }) {
    console.log(PUBLISH_DIR, PUBLISH_DIR === BUILD_DIR, !Object.keys(constants).includes(BUILD_DIR))
  },
}
