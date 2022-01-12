export const onBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: 'onBuild' })
}

export const onSuccess = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: 'onSuccess' })
}
