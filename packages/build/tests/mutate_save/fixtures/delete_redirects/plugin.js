export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.build.environment.TEST = 'test'
}
