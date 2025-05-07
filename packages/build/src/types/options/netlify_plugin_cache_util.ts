import type { Many } from '../utils/many.js'

/**
 * Cache files between builds
 */
export type NetlifyPluginCacheUtil = {
  save(
    path: Many<string>,
    options?: {
      /**
       * @default `false`
       */
      move?: boolean
      ttl?: number
      digests?: string[]
      /**
       * @default `process.cwd()`
       */
      cwd?: string
    },
  ): Promise<boolean>
  restore(
    path: Many<string>,
    options?: {
      /**
       * @default `false`
       */
      move?: boolean
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
  'remove' | 'has',
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
