import type { Options as ExecaOptions, ExecaChildProcess } from 'execa'

type NetlifyPluginRunUtilOptions = Omit<ExecaOptions, 'preferLocal'> & {
  /**
   * @default true
   */
  preferLocal?: boolean
}

// A child process, which is also a promise of its result.
type NetlifyPluginRunUtilResult = ExecaChildProcess

/**
 * Run commands and processes
 * @see https://github.com/netlify/build/blob/master/packages/run-utils/README.md
 */
export interface NetlifyPluginRunUtil {
  (file: string, args?: readonly string[], options?: NetlifyPluginRunUtilOptions): NetlifyPluginRunUtilResult
  command(command: string, options?: NetlifyPluginRunUtilOptions): NetlifyPluginRunUtilResult
}
