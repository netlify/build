import baseConfig from '../../ava.base.js'

const config = {
  ...baseConfig,
  files: ['tests/*.{cjs,mjs,js,ts}', 'tests/**/tests.{cjs,mjs,js,ts}'],
  verbose: true,
}

export default config
