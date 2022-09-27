export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.build.services = { identity: 'two' }
}

export const onBuild = function ({
  netlifyConfig: {
    build: { services },
  },
}) {
  console.log(services)
}
