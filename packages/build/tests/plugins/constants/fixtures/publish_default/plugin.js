module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR, PUBLISH_DIR === __dirname)
  },
}
