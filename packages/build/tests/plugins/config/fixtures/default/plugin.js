module.exports = {
  name: 'netlify-plugin-test',
  config: {
    properties: {
      test: { default: 'test' },
    },
  },
  init({ pluginConfig: { test } }) {
    console.log(test)
  },
}
