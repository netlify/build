export const onPreBuild = function ({ netlifyConfig: { build } }) {
  build.command = 'node --version'
}

export const onBuild = function ({
  netlifyConfig: {
    build: { command },
  },
}) {
  console.log(command)
}
