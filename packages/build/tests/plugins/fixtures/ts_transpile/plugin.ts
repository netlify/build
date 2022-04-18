import { OnPreBuild } from '@netlify/build'

export const onPreBuild: OnPreBuild = function ({ constants: { IS_LOCAL } }) {
  console.log(typeof IS_LOCAL === 'boolean')
}
