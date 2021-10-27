import { Many } from '../utils/many'

/**
 * Cache files between builds
 */
export type NetlifyPluginCacheUtil = {
  save(
    path: Many<string>,
    options?: {
      ttl?: number
      digests?: string[]
      /**
       * @default `process.cwd()`
       */
      cwd?: string
    },
  ): Promise<boolean>
  list(options?: {
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
    path: Many<string>,
    options?: {
      /**
       * @default `process.cwd()`
       */
      cwd?: string
    },
  ) => Promise<boolean>
>
