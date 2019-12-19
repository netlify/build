module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { run } }) {
    const { stdout } = await run('ava', ['--version'], { stdio: 'pipe' })
    console.log({ stdout })
  },
}
