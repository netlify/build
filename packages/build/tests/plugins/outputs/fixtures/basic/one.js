module.exports = {
  name: 'one',
  outputs: {
    example: {
      when: 'onBuild',
    },
  },
  onBuild() {
    return { example: true }
  },
}
