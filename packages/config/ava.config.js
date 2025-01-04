import baseConfig from '../../ava.base.js'

const config = {
  ...baseConfig,
  workerThreads: false,
  files: ['tests/*.{cjs,mjs,js}', 'tests/**/tests.{cjs,mjs,js}'],
}

export default config
