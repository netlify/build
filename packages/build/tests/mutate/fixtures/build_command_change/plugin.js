export const onPreBuild = function ({ netlifyConfig: { build } }) {
  // eslint-disable-next-line no-param-reassign
  build.command = 'node --version'
}

export const onBuild = function ({
  netlifyConfig: {
    build: { command },
  },
}) {
  console.log(command)
}
