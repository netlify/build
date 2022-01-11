export const onPreBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild('test')
}
