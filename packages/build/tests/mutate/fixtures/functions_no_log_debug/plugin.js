export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions.node_bundler = 'esbuild'
}
