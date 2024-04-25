export const onBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  const errorMetadata = { foo: 'bar' }
  failBuild('error', { errorMetadata })
}
