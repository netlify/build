import { NetlifyPluginBuildUtil } from './netlify_plugin_build_util'
import { NetlifyPluginCacheUtil } from './netlify_plugin_cache_util'
import { NetlifyPluginGitUtil } from './netlify_plugin_git_util'
import { NetlifyPluginRunUtil } from './netlify_plugin_run_util'
import { NetlifyPluginStatusUtil } from './netlify_plugin_status_util'

export interface NetlifyPluginUtils {
  build: NetlifyPluginBuildUtil
  status: NetlifyPluginStatusUtil
  cache: NetlifyPluginCacheUtil
  run: NetlifyPluginRunUtil
  git: NetlifyPluginGitUtil
}
