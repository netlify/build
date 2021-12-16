export default {
  onPreBuild({ netlifyConfig }) {
    Object.defineProperty(netlifyConfig.build, 'ignore', { value: '', enumerable: true })
  },
}
