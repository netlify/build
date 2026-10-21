declare module '@netlify/plugins-list' {
  export const pluginsList: import('./plugins/list.js').PluginListEntry[]
  export const pluginsUrl: string
}
