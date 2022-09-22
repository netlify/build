export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig[Symbol('test')] = true
}
