module.exports = {
  name: 'netlify-plugin-test',
  onInit({ pluginConfig: { foo } }) {
    console.log(foo)
  },
}
