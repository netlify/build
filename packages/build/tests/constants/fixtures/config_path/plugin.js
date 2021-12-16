export default {
  onPreBuild({ constants: { CONFIG_PATH } }) {
    console.log(CONFIG_PATH)
  },
}
