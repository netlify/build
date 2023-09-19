import type { NetlifyPluginBuildUtil } from './netlify_plugin_build_util.js'
import type { NetlifyPluginCacheUtil } from './netlify_plugin_cache_util.js'
import type { NetlifyPluginFunctionsUtil } from './netlify_plugin_functions_util.js'
import type { NetlifyPluginGitUtil } from './netlify_plugin_git_util.js'
import type { NetlifyPluginRunUtil } from './netlify_plugin_run_util.js'
import type { NetlifyPluginStatusUtil } from './netlify_plugin_status_util.js'

export interface NetlifyPluginUtils {
  build: NetlifyPluginBuildUtil
  status: NetlifyPluginStatusUtil
  cache: NetlifyPluginCacheUtil
  run: NetlifyPluginRunUtil
  git: NetlifyPluginGitUtil
  functions: NetlifyPluginFunctionsUtil
}
