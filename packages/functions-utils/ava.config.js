import baseConfig from '../../ava.base.js'

const config = {
  ...baseConfig,
  /*Remove extensions & nodeArguments after migrating tests to Typescript*/
  extensions: undefined,
  nodeArguments: undefined,
  files: ['tests/*.{cjs,mjs,js}', 'tests/**/tests.{cjs,mjs,js}'],
}

export default config
