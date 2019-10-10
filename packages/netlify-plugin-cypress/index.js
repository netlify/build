module.exports = {
  postBuild() {
    console.log('running cypress integration tests')
  },
  manifest() {
    console.log('manifest thing netlifyCypressPlugin')
  }
}
