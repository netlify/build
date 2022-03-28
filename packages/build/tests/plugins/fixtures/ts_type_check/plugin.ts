import { NetlifyPlugin } from '@netlify-labs/build-internal'

export const onPreBuild: NetlifyPlugin['onPreBuild'] = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild()
}
