import baseConfig from '../../ava.base.js'

const config = {
  ...baseConfig,
  files: ['tests/**/tests.{cjs,mjs,js}'],
}

export default config
