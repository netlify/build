import { platform } from 'node:os'
import { env } from 'node:process'

import baseConfig from '../../ava.base.js'

const config = {
  ...baseConfig,
  files: ['tests/**/tests.{cjs,mjs,js}'],
  // github action runners for osx have lower memory than windows/linux
  // https://docs.github.com/en/actions/using-github-hosted-runners/using-github-hosted-runners/about-github-hosted-runners#standard-github-hosted-runners-for-public-repositories
  serial: env.GITHUB_ACTIONS && platform() === 'darwin',
}

export default config
