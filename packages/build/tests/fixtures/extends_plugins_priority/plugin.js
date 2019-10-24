module.exports = {
  name: 'netlify-plugin-test',
  init({ pluginConfig: { test } }) {
    console.log(test)
  },
}
