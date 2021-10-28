import { onPreBuild } from '../netlify_plugin'

const testUtilsStatus: onPreBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: 'summary' })
  show({ summary: 'summary', title: 'title', text: 'text' })
}
