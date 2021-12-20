export default {
  onPreBuild({ netlifyConfig }) {
    netlifyConfig.functions['*'].included_files.push('two')
  },
}
