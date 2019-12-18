module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ utils: { exec } }) {
    await exec('ava', ['--version'], { stdio: 'inherit', preferLocal: true })
  },
}
