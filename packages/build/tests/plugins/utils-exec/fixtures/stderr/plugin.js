module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { exec } }) {
    const { stdout } = await exec('ava', ['--version'], { stderr: 'pipe' })
    console.log({ stdout })
  },
}
