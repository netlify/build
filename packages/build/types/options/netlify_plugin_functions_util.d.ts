import type { listFunctions, listFunctionsFiles } from '@netlify/zip-it-and-ship-it'

type Resolved<T> = T extends Promise<infer U> ? U : T

export type ListedFunction = Resolved<ReturnType<typeof listFunctions>>[0]
export type ListedFunctionFile = Resolved<ReturnType<typeof listFunctionsFiles>>[0]

export interface NetlifyPluginFunctionsUtil {
  /**
   * Returns the list of Netlify Functions main files as a Promise resolving to an array of objects with the following properties:
   *
   * - `name`: Function name, as used in the URL `https://{hostname}/.netlify/functions/{name}`
   * - `mainFile`: absolute path to the Function's main file
   * - `extension`: file extension of the Function's main file. For Go Functions, this might be an empty string.  For Node.js Functions, this is either `.js` or `.zip`.
   * - `runtime` `"js" | "go"`: Function's language runtime. TypeScript Functions use the "js" runtime
   */
  list(): Promise<Array<ListedFunction>>

  /**
   * Same as `list()` except it also returns the files required by the Functions' main files. This is much slower. The object have the following additional member:
   *
   * - `srcFile`: absolute path to the file
   */
  listAll(): Promise<Array<ListedFunctionFile>>

  /**
   * Add a Functions file or directory to a build.
   *
   * @param path Path to the function file or directory.
   */
  add(path: string): Promise<void>
}
