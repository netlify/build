type GlobPattern = string

/* eslint-disable camelcase -- some properties are named in snake case in this API */
type FunctionsObject = {
  /**
   * a list of additional paths to include in the function bundle. Although our build system includes statically referenced files (like `import * from "./some-file.js"`) by default, `included_files` lets you specify additional files or directories and reference them dynamically in function code. You can use `*` to match any character or prefix an entry with `!` to exclude files. Paths are relative to the [base directory](https://docs.netlify.com/configure-builds/get-started/#definitions-1).
   */
  included_files?: string[]
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
      node_bundler?: 'esbuild'

      /**
       * a list of Node.js modules that are copied to the bundled artifact without adjusting their source or references during the bundling process.
       * This property helps handle dependencies that can’t be inlined, such as modules with native add-ons.
       */
      external_node_modules?: string[]

      ignored_node_modules?: string[]
    }
)
/* eslint-enable camelcase */

export type Functions = {
  '*': FunctionsObject
  [pattern: GlobPattern]: FunctionsObject
}
