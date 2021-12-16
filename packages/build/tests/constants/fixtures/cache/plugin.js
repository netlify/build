export default {
  onPreBuild({ constants: { CACHE_DIR } }) {
    console.log(CACHE_DIR)
  },
}
