export const onPreBuild = function ({ netlifyConfig }) {
  Object.defineProperty(netlifyConfig.build, 'ignore', { value: '', enumerable: true })
}
