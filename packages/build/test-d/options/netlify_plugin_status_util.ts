import type { NetlifyPluginUtils, OnPreBuild } from '@netlify/build'

export const testUtilsStatus: OnPreBuild = function ({
  utils: {
    status: { show },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  show({ summary: 'summary' })
  show({ summary: 'summary', title: 'title', text: 'text' })
}
