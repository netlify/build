module.exports = {
  onInit({
    utils: {
      git: { linesOfCode },
    },
  }) {
    console.log({ linesOfCode })
  },
}
