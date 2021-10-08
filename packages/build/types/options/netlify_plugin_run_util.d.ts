interface NetlifyPluginRunUtilOptions {
  env?: Partial<Record<string, string>>
}

interface NetlifyPluginRunUtilResult {
  stdout: string
  stderr: string
  exitCode: number
}

/**
 * Run commands and processes
 * @see https://github.com/netlify/build/blob/master/packages/run-utils/README.md
 */
export interface NetlifyPluginRunUtil {
  (
    file: string,
    // eslint-disable-next-line fp/no-arguments -- params are named `arguments` in the docs. Unrelated to JS's `arguments`
    arguments: readonly string[],
    options?: NetlifyPluginRunUtilOptions,
  ): Promise<NetlifyPluginRunUtilResult>
  command(command: string, options?: NetlifyPluginRunUtilOptions): Promise<NetlifyPluginRunUtilResult>
}
