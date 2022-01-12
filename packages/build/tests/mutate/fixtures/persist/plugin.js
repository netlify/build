export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.build.command = 'node --version'
}

export const onBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.functions['*'].external_node_modules = ['test']
}

export const onPostBuild = function ({ netlifyConfig }) {
  console.log(netlifyConfig.build.command)
  console.log(netlifyConfig.functions['*'].external_node_modules)
}
