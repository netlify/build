/**
 * Cache files between builds
 */
export type NetlifyPluginCacheUtil = {
  save(
    path: string | readonly string[],
    options?: {
      ttl?: number
      digests?: string[]
      /**
       * @default `process.cwd()`
       */
      cwd?: string
    },
  ): Promise<boolean>
  list(options: {
    /**
     * @default `process.cwd()`
     */
    cwd?: string
    /**
     * @default 1
     */
    depth?: number
  }): Promise<string[]>
} & Record<
  'restore' | 'remove' | 'has',
  (
    path: string | readonly string[],
    options?: {
      /**
       * @default `process.cwd()`
       */
      cwd?: string
    },
  ) => Promise<boolean>
>
