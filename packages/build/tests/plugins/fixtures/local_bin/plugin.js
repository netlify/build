import { execa } from 'execa'

export const onPreBuild = async function () {
  await execa('atob', ['dGVzdA=='], { stdio: 'inherit', verbose: 'full' })
}
