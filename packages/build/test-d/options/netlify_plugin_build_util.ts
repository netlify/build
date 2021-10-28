import { onPreBuild } from '../netlify_plugin'

const testUtilsBuildFailBuild: onPreBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild('message')
  failBuild('message', {})
  failBuild('message', { error: new Error('message') })
}

const testUtilsBuildFailPlugin: onPreBuild = function ({
  utils: {
    build: { failPlugin },
  },
}) {
  failPlugin('message')
  failPlugin('message', {})
  failPlugin('message', { error: new Error('message') })
}

const testUtilsBuildCancelBuild: onPreBuild = function ({
  utils: {
    build: { cancelBuild },
  },
}) {
  cancelBuild('message')
  cancelBuild('message', {})
  cancelBuild('message', { error: new Error('message') })
}
