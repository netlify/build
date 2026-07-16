type GlobPattern = string

type FunctionsObject = {
  /**
   * marks the function as a [background function](https://docs.netlify.com/functions/background-functions/), which is invoked asynchronously and can run for up to 15 minutes.
   */
  background?: boolean
  /**
   * a list of additional paths to include in the function bundle. Although our build system includes statically referenced files (like `import * from "./some-file.js"`) by default, `included_files` lets you specify additional files or directories and reference them dynamically in function code. You can use `*` to match any character or prefix an entry with `!` to exclude files. Paths are relative to the [base directory](https://docs.netlify.com/configure-builds/get-started/#definitions-1).
   */
  included_files?: string[]
  /**
   * the amount of memory allocated to the function, expressed either as a number of MB or as a string with a unit (e.g. `"2gb"`). Mutually exclusive with `vcpu`.
   */
  memory?: number | string
  /**
   * the [region](https://docs.netlify.com/functions/optional-configuration/#region) the function should run in, identified by its airport code (e.g. `"cmh"`).
   */
  region?: string
  /**
   * the number of vCPUs allocated to the function (between `0.5` and `2`). Mutually exclusive with `memory`.
   */
  vcpu?: number
} & (
  | {
      /**
       * the function bundling method used in [`@netlify/zip-it-and-ship-it`](https://github.com/netlify/zip-it-and-ship-it).
       */
      node_bundler?: 'zisi' | 'nft'
    }
  | {
      /**
       * the function bundling method used in [`@netlify/zip-it-and-ship-it`](https://github.com/netlify/zip-it-and-ship-it).
       */
      node_bundler?: 'esbuild' | 'none'

      /**
       * a list of Node.js modules that are copied to the bundled artifact without adjusting their source or references during the bundling process.
       * This property helps handle dependencies that can’t be inlined, such as modules with native add-ons.
       */
      external_node_modules?: string[]

      ignored_node_modules?: string[]
    }
)

export type Functions = {
  '*': FunctionsObject & { deno_import_map?: string }
  [pattern: GlobPattern]: FunctionsObject
}
