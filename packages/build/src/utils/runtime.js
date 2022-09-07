export const isRuntime = function (pluginOption) {
  const { packageName } = pluginOption
  // Make this a bit more robust in the future
  return ['@netlify/next-runtime', '@netlify/plugin-nextjs'].includes(packageName)
}
