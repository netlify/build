export default {
  onPreBuild({ constants: { NETLIFY_BUILD_VERSION } }) {
    console.log(NETLIFY_BUILD_VERSION)
  },
}
