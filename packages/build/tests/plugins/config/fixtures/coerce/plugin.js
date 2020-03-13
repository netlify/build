module.exports = {
  name: 'netlify-plugin-test',
  inputs: {
    properties: {
      test: { type: 'array' },
    },
  },
  onInit({ inputs: { test } }) {
    console.log(JSON.stringify(test))
  },
}
