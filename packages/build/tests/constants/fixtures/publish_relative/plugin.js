export default {
  onPreBuild({ constants: { PUBLISH_DIR } }) {
    console.log(PUBLISH_DIR)
  },
}
