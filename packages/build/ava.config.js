import baseConfig from '../../ava.base.js'

const config = {
  ...baseConfig,
  compile: false,
  files: ['tests/**/tests.{cjs,mjs,js}'],
}

export default config
