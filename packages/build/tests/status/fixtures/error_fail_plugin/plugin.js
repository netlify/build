export const onBuild = function ({
  utils: {
    build: { failPlugin },
  },
}) {
  failPlugin('error')
}
