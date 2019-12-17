module.exports = {
  name: 'netlify-plugin-test',
  onInit({
    utils: {
      git: { linesOfCode },
    },
  }) {
    console.log({ linesOfCode })
  },
}
