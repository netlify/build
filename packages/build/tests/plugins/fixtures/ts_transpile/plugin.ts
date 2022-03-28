import { OnPreBuild } from '@netlify-labs/build-internal'

export const onPreBuild: OnPreBuild = function ({ constants: { IS_LOCAL } }) {
  console.log(typeof IS_LOCAL === 'boolean')
}
