import { NetlifyPlugin } from '@netlify/build'

export const onPreBuild: NetlifyPlugin['onPreBuild'] = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild()
}
