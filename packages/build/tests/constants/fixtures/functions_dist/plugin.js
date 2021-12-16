export default {
  onPreBuild({ constants: { FUNCTIONS_DIST } }) {
    console.log(FUNCTIONS_DIST)
  },
}
