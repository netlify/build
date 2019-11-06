module.exports = {
  name: 'netlify-plugin-test',
  config: {
    test: { default: 'test' },
  },
  init({ pluginConfig: { test } }) {
    console.log({ test })
  },
}
