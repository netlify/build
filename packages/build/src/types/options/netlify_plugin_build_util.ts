/**
 * Report errors or cancel builds
 */
export type NetlifyPluginBuildUtil = Record<
  'failBuild' | 'failPlugin' | 'cancelBuild',
  (message: string, options?: { error?: Error }) => never
>
