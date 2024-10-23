export const isNextJsAdapter = (pluginOption: { packageName: string }) => {
  const { packageName } = pluginOption
  // Make this a bit more robust in the future
  return [
    // Name used up until v5.8.1
    '@netlify/plugin-nextjs',
    // Name briefly used for v5 prereleases, but then backed out of before stable
    '@netlify/next-runtime',
    // Renamed starting at v5.9.0
    '@opennextjs/netlify',
  ].includes(packageName)
}
