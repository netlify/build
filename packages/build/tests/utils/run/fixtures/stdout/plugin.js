module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { run } }) {
    const { stdout } = await run('ava', ['--version'], { stdout: 'pipe' })
    console.log({ stdout })
  },
}
