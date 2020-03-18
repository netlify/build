module.exports = {
  async onInit({ utils: { run } }) {
    const { stdout } = await run('ava', ['--version'], { stdout: 'pipe' })
    console.log({ stdout })
  },
}
