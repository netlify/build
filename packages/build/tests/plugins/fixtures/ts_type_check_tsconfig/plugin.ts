import { NetlifyPlugin } from '@netlify/build'

export const onPreBuild: NetlifyPlugin['onPreBuild'] = function () {
  console.log(String(<string>undefined))
}
