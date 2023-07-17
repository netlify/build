import baseConfig from '../../ava.base.js'

const config = {
  ...baseConfig,
  files: ['tests/*.{cjs,mjs,ts,js}', 'tests/**/tests.{cjs,mjs,ts,js}'],
}

export default config
