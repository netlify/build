export const onEnd = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild('test')
}
