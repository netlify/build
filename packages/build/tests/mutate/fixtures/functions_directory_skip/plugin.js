export default {
  onPreBuild({ netlifyConfig }) {
    console.log(netlifyConfig.functionsDirectory)
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functions.directory = ''
  },
}
