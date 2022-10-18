const NETLIFY_MAINTAINED_PLUGINS = new Set([
  'netlify_plugin_gatsby_cache',
  'netlify_plugin_sitemap',
  'netlify_plugin_debug_cache',
  'netlify_plugin_is_website_vulnerable',
  'netlify_plugin_lighthouse',
  'netlify_plugin_nextjs',
  'netlify_plugin_gatsby',
])

export const isNetlifyMaintainedPlugin = (pluginPackage: string): boolean =>
  NETLIFY_MAINTAINED_PLUGINS.has(pluginPackage)
