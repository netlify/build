import type { Many } from '../utils/many.js'

import type { Build } from './build.js'
import type { Functions } from './functions.js'
import type { PluginInputs } from './inputs.js'

type HttpStatusCode = number

interface Redirect {
  from: string
  to?: string
  status?: HttpStatusCode
  force?: boolean
  signed?: string
  query?: Partial<Record<string, string>>
  headers?: Partial<Record<string, string>>
  conditions?: Partial<Record<'Language' | 'Role' | 'Country' | 'Cookie', readonly string[]>>
}

interface Header {
  for: string
  values: Partial<Record<string, Many<string, 'mutable'>>>
}

interface EdgeFunction {
  path?: `/${string}`
  function: string
}

interface NetlifyPlugin {
  package: string
  inputs: PluginInputs
}

interface DatabaseMigrationsConfig {
  path?: string
}

interface DatabaseConfig {
  migrations?: DatabaseMigrationsConfig
}

interface ServerConfig {
  /**
   * One or more URL paths the server handles, each starting with `/`
   */
  path?: Many<`/${string}`, 'mutable'>

  /**
   * One or more URL paths within `path` that the server doesn't handle, each
   * starting with `/`
   */
  excludedPath?: Many<`/${string}`, 'mutable'>

  /**
   * Glob patterns of additional files to include in the server's bundle,
   * relative to the base directory
   */
  includedFiles?: string[]

  /**
   * Airport code of the region the server runs in
   */
  region?: 'cmh' | 'fra'

  /**
   * How many instances the server runs
   */
  scale?: {
    /**
     * Minimum number of instances to keep running, an integer of 0 or more
     */
    min?: number

    /**
     * Maximum number of instances to run, an integer of 1 or more, and no less
     * than `min`
     */
    max?: number
  }

  /**
   * Size of the instances the server runs on
   */
  size?: 'small' | 'medium' | 'large'
}

interface ImagesConfig {
  remote_images: string[]
}

export interface NetlifyConfig {
  /**
   * array of redirects with their modifiable options
   */
  redirects: Redirect[]
  /**
   * array of headers with their modifiable options
   */
  headers: Header[]
  /**
   * array of Edge Functions with their modifiable options
   */
  edge_functions: EdgeFunction[]
  /**
   * object with options for modifying [functions](https://docs.netlify.com/configure-builds/file-based-configuration/#functions)
   */
  functions: Functions
  build: Build
  plugins: readonly NetlifyPlugin[]
  /**
   * object with options for image transforms
   */
  images: ImagesConfig
  /**
   * object with options for database configuration
   */
  database?: DatabaseConfig
  /**
   * object with options for the Netlify Server
   */
  server?: ServerConfig
  /**
   * Whether the site is a single-page application (SPA). Defaults to `false`.
   */
  spa_fallback?: boolean
}
