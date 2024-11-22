const NETLIFY_MAINTAINED_PLUGINS = new Set([
  'netlify_plugin_gatsby_cache',
  'netlify_plugin_sitemap',
  'netlify_plugin_debug_cache',
  'netlify_plugin_is_website_vulnerable',
  'netlify_plugin_lighthouse',
  'netlify_plugin_nextjs',
  'netlify_plugin_gatsby',
])

const NETLIFY_MAINTAINED_EXTENSIONS = new Set([
  'content_security_policy_buildhooks',
  'contentful_buildhooks',
  'planetscale_buildhooks',
  'okta_buildhooks',
  'wordpress_content_buildhooks',
  'agility_content_buildhooks',
  'shopify_content_buildhooks',
  'aem_content_buildhooks',
  'drupal_content_buildhooks',
  'supabase_buildhooks',
  'contentstack_content_buildhooks',
  'async_workloads_buildhooks',
  'turso_buildhooks',
  'lambda_test_buildhooks',
  'bluesky_custom_domain_buildhooks',
  'launchdarkly_buildhooks',
  'sfcc_content_buildhooks',
  'commercetools_content_buildhooks',
  'optimizely_edge_delivery_buildhooks',
])

export const isNetlifyMaintainedPlugin = (pluginPackage: string): boolean =>
  NETLIFY_MAINTAINED_PLUGINS.has(pluginPackage) || NETLIFY_MAINTAINED_EXTENSIONS.has(pluginPackage)
