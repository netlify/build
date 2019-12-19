module.exports = {
  name: 'netlify-plugin-test',
  onInit({
    utils: {
      git: { fileMatch },
    },
  }) {
    const { modified, created, deleted, edited } = fileMatch('**/*npm*', '!**/*run-npm*')
    console.log({ modified, created, deleted, edited })
  },
}
