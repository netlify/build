export default {
  onPreBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
  onBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
