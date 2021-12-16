export default {
  onBuild({ netlifyConfig }) {
    console.log(netlifyConfig.functionsDirectory)
  },
}
