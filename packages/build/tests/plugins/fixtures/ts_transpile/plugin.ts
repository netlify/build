import { NetlifyPlugin } from '@netlify/build'

export const onPreBuild: NetlifyPlugin['onPreBuild'] = function ({ constants: { IS_LOCAL } }) {
  console.log(typeof IS_LOCAL === 'boolean')
}
