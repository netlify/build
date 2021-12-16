export default {
  onPreBuild({ netlifyConfig }) {
    Object.defineProperty(netlifyConfig.build, 'command', { value: undefined })
  },
}
