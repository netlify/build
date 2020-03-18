module.exports = {
  async onInit({ utils: { run } }) {
    const { stdout } = await run('ava', ['--version'], { stderr: 'pipe' })
    console.log({ stdout })
  },
}
