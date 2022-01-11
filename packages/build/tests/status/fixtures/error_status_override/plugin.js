export const onBuild = function () {
  throw new Error('onBuild')
}

export const onSuccess = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: 'summary' })
}

export const onError = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: 'summary' })
}

export const onEnd = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: 'summary' })
}
