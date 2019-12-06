module.exports = {
  name: 'netlify-plugin-test',
  config: {
    properties: {
      test: { default: 'test' },
    },
  },
  onInit({ pluginConfig: { test } }) {
    console.log(test)
  },
}
