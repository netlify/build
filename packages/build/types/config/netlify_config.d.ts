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

/* eslint-disable camelcase -- some properties are named in snake case in this API */

interface NetlifyConfig {
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
}

/* eslint-enable camelcase */
