module.exports = {
  name: 'netlify-plugin-test',
  config: {
    properties: {
      test: { type: 'array' },
    },
  },
  onInit({ pluginConfig: { test } }) {
    console.log(JSON.stringify(test))
  },
}
