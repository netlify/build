declare module '@netlify/plugins-list' {
  export const pluginsList: import('./plugins/list.js').PluginListEntry[]
  export const pluginsUrl: string
}

declare module 'safe-json-stringify' {
  const safeJsonStringify: {
    // Only called with plain objects without `toJSON()`, which map to plain objects
    ensureProperties: (data: object) => Record<string, unknown>
  }
  export default safeJsonStringify
}
