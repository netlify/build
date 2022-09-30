export const onBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  const extraInfo = { foo: 'bar' }
  failBuild('error', { extraInfo })
}
