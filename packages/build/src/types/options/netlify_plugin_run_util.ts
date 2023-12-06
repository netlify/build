import type { Options as ExecaOptions, ExecaChildProcess } from 'execa'

type NetlifyPluginRunUtilOptions = Omit<ExecaOptions, 'preferLocal'> & {
  /**
   * @default true
   */
  preferLocal?: ExecaOptions['preferLocal']
}

type NetlifyPluginRunUtilResult = ExecaChildProcess

/**
 * Run commands and processes
 * @see https://github.com/netlify/build/blob/master/packages/run-utils/README.md
 */
export interface NetlifyPluginRunUtil {
  (file: string, args?: readonly string[], options?: NetlifyPluginRunUtilOptions): Promise<NetlifyPluginRunUtilResult>
  command(command: string, options?: NetlifyPluginRunUtilOptions): Promise<NetlifyPluginRunUtilResult>
}
