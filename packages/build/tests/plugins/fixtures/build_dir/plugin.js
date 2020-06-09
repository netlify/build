module.exports = {
  onPreBuild({ constants: { BUILD_DIR } }) {
    console.log(BUILD_DIR)
  },
}
