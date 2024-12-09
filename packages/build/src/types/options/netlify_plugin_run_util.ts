import type { Options as ExecaOptions, ResultPromise } from 'execa'

type NetlifyPluginRunUtilOptions = Omit<ExecaOptions, 'preferLocal'> & {
  /**
   * @default true
   */
  preferLocal?: ExecaOptions['preferLocal']
}

/**
 * Run commands and processes
 * @see https://github.com/netlify/build/blob/master/packages/run-utils/README.md
 */
export interface NetlifyPluginRunUtil {
  (file: string, args?: readonly string[], options?: NetlifyPluginRunUtilOptions): ResultPromise
  command(command: string, options?: NetlifyPluginRunUtilOptions): ResultPromise
}
