module.exports = {
  name: 'netlify-plugin-test',
  config: {
    properties: {
      test: { type: 'array' },
    },
  },
  init({ pluginConfig: { test } }) {
    console.log(JSON.stringify(test))
  },
}
