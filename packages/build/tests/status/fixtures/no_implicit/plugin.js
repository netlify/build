export const onBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: 'summary' })
}

export const onSuccess = function () {}
