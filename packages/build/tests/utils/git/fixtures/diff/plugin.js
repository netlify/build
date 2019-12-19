module.exports = {
  name: 'netlify-plugin-test',
  onInit({
    utils: {
      git: { modifiedFiles, createdFiles, deletedFiles },
    },
  }) {
    console.log(JSON.stringify({ modifiedFiles, createdFiles, deletedFiles }))
  },
}
