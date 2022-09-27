import baseConfig from '../../ava.config.js'

const config = {
  ...baseConfig,
  files: ['tests/*.{cjs,mjs,js}', 'tests/**/tests.{cjs,mjs,js}'],
}

export default config
