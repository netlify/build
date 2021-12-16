export default {
  onPreBuild({ netlifyConfig: { plugins } }) {
    console.log(Array.isArray(plugins))
  },
}
