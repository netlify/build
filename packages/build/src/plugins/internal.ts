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
  'content-security-policy-buildhooks',
  'contentful-buildhooks',
  'planetscale-buildhooks',
  'okta-buildhooks',
  'wordpress-content-buildhooks',
  'agility-content-buildhooks',
  'shopify-content-buildhooks',
  'aem-content-buildhooks',
  'drupal-content-buildhooks',
  'supabase-buildhooks',
  'contentstack-content-buildhooks',
  'async-workloads-buildhooks',
  'turso-buildhooks',
  'lambda-test-buildhooks',
  'bluesky-custom-domain-buildhooks',
  'launchdarkly-buildhooks',
  'sfcc-content-buildhooks',
  'commercetools-content-buildhooks',
  'optimizely-edge-delivery-buildhooks',
])

export const isNetlifyMaintainedPlugin = (pluginPackage: string): boolean =>
  NETLIFY_MAINTAINED_PLUGINS.has(pluginPackage) || NETLIFY_MAINTAINED_EXTENSIONS.has(pluginPackage)
