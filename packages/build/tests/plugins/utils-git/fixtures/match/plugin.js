module.exports = {
  name: 'netlify-plugin-test',
  onInit({
    utils: {
      git: { match },
    },
  }) {
    const { modified, created, deleted, edited } = match('**/*npm*', '!**/*run-npm*')
    console.log({ modified, created, deleted, edited })
  },
}
