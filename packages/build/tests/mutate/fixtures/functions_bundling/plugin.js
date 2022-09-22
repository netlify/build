export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions.test.node_bundler = 'zisi'
}
