import type { OnPreBuild, NetlifyPluginUtils } from '@netlify/build'

export const testUtilsBuildFailBuild: OnPreBuild = function ({
  utils: {
    build: { failBuild },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  failBuild('message')
  failBuild('message', {})
  failBuild('message', { error: new Error('message') })
}

export const testUtilsBuildFailPlugin: OnPreBuild = function ({
  utils: {
    build: { failPlugin },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  failPlugin('message')
  failPlugin('message', {})
  failPlugin('message', { error: new Error('message') })
}

export const testUtilsBuildCancelBuild: OnPreBuild = function ({
  utils: {
    build: { cancelBuild },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  cancelBuild('message')
  cancelBuild('message', {})
  cancelBuild('message', { error: new Error('message') })
}
