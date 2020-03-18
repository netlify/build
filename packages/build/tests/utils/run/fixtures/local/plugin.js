module.exports = {
  async onInit({ utils: { run } }) {
    await run('ava', ['--version'])
  },
}
