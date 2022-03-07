export const onBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild('error')
}
