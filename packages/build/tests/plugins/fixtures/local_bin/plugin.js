import execa from 'execa'

export default {
  async onPreBuild() {
    await execa('atob', ['dGVzdA=='], { stdio: 'inherit' })
  },
}
