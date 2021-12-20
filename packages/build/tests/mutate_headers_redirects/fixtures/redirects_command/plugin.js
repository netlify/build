export default {
  onPreBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
  onBuild({ netlifyConfig: { redirects } }) {
    console.log(redirects)
  },
}
