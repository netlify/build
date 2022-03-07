export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.build.services.identity = 'two'
}

export const onBuild = function ({
  netlifyConfig: {
    build: { services },
  },
}) {
  console.log(services)
}
