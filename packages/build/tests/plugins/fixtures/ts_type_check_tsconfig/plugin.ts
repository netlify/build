import { NetlifyPlugin } from '@netlify-labs/build-internal'

export const onPreBuild: NetlifyPlugin['onPreBuild'] = function () {
  console.log(String(<string>undefined))
}
