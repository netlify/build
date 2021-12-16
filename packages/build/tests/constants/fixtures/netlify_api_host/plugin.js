export default {
  onPreBuild({ constants: { NETLIFY_API_HOST } }) {
    console.log(NETLIFY_API_HOST)
  },
}
