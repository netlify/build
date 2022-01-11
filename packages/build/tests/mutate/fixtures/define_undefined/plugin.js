export const onPreBuild = function ({ netlifyConfig }) {
  Object.defineProperty(netlifyConfig.build, 'command', { value: undefined })
}
