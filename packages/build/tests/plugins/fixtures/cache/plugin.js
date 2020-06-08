module.exports = {
  async onPreBuild({ constants: { CACHE_DIR } }) {
    console.log(CACHE_DIR)
  },
}
