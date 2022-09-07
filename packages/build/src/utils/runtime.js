export const isRuntime = function (pluginOption) {
  // Make this a bit more robust in the future
  const {packageName} = pluginOption
  return ['@netlify/next-runtime', '@netlify/plugin-nextjs'].includes(packageName)
}
