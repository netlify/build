module.exports = {
  onPreBuild({ netlifyConfig: { plugins } }) {
    console.log(Array.isArray(plugins))
  },
}
