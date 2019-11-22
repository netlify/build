module.exports = {
  name: 'netlify-plugin-test',
  init({ constants: { CONFIG_PATH } }) {
    console.log(CONFIG_PATH)
  },
}
