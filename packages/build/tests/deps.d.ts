// `@netlify/plugins-list` has no types. `src/deps.d.ts` declares it for the sources, against their own types.
declare module '@netlify/plugins-list' {
  export const pluginsList: import('../lib/plugins/list.js').PluginListEntry[]
  export const pluginsUrl: string
}
