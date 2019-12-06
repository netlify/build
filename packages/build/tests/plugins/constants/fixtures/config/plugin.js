module.exports = {
  name: 'netlify-plugin-test',
  onInit({ constants: { CONFIG_PATH } }) {
    console.log(CONFIG_PATH)
  },
}
