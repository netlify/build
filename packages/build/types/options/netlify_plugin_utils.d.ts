import type { NetlifyPluginBuildUtil } from './netlify_plugin_build_util.d.ts'
import type { NetlifyPluginCacheUtil } from './netlify_plugin_cache_util.d.ts'
import type { NetlifyPluginFunctionsUtil } from './netlify_plugin_functions_util.d.ts'
import type { NetlifyPluginGitUtil } from './netlify_plugin_git_util.d.ts'
import type { NetlifyPluginRunUtil } from './netlify_plugin_run_util.d.ts'
import type { NetlifyPluginStatusUtil } from './netlify_plugin_status_util.d.ts'

export interface NetlifyPluginUtils {
  build: NetlifyPluginBuildUtil
  status: NetlifyPluginStatusUtil
  cache: NetlifyPluginCacheUtil
  run: NetlifyPluginRunUtil
  git: NetlifyPluginGitUtil
  functions: NetlifyPluginFunctionsUtil
}
