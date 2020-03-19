module.exports = {
  onInit({
    utils: {
      git: { fileMatch },
    },
  }) {
    const { modified, created, deleted, edited } = fileMatch('**/*npm*', '!**/*run-npm*')
    console.log(JSON.stringify({ modified, created, deleted, edited }))
  },
}
