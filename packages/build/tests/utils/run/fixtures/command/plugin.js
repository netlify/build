module.exports = {
  async onInit({ utils: { run } }) {
    await run.command('ava --version')
  },
}
