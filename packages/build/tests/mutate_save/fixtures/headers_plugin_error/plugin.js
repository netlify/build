export default {
  onPreBuild({ netlifyConfig }) {
    netlifyConfig.headers.push({ values: {} })
  },
  onBuild({ netlifyConfig: { headers } }) {
    console.log(headers)
  },
}
