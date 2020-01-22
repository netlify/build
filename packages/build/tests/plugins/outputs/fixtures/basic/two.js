module.exports = {
  name: 'two',
  config: {
    properties: {
      test: {
        type: 'string',
      },
    },
  },
  onInit({ pluginConfig: { test } }) {
    console.log({ test })
  },
  onBuild({ pluginConfig: { test } }) {
    console.log({ test })
  },
}
