import { dirname, extname, resolve } from 'path'

import { build, BuildOptions } from 'esbuild'

import type { FunctionConfig } from '../../../../config.js'
import type { FeatureFlags } from '../../../../feature_flags.js'
import { FunctionBundlingUserError } from '../../../../utils/error.js'
import { getPathWithExtension } from '../../../../utils/fs.js'
import { RUNTIME } from '../../../runtime.js'
import { CJS_SHIM } from '../../utils/esm_cjs_compat.js'
import { MODULE_FORMAT, MODULE_FILE_EXTENSION, ModuleFormat } from '../../utils/module_format.js'
import { getClosestPackageJson } from '../../utils/package_json.js'
import { getBundlerTarget } from '../esbuild/bundler_target.js'
import { NODE_BUNDLER } from '../types.js'

type Transformer = {
  aliases: Map<string, string>
  bundle?: boolean
  bundledPaths?: string[]
  format: ModuleFormat
  newMainFile?: string
  rewrites: Map<string, string>
}

/**
 * Returns the module format that should be used for a given function file.
 */
const getModuleFormat = async (
  mainFile: string,
  runtimeAPIVersion: number,
  repositoryRoot?: string,
): Promise<ModuleFormat> => {
  const extension = extname(mainFile)

  // TODO: This check should go away. We should always respect the format from
  // the extension. We'll do this at a later stage, after we roll out the V2
  // API with no side-effects on V1 functions.
  if (runtimeAPIVersion === 2) {
    if (extension === MODULE_FILE_EXTENSION.MJS || extension === MODULE_FILE_EXTENSION.MTS) {
      return MODULE_FORMAT.ESM
    }

    if (extension === MODULE_FILE_EXTENSION.CTS || extension === MODULE_FILE_EXTENSION.CTS) {
      return MODULE_FORMAT.COMMONJS
    }
  }

  // At this point, we need to infer the module type from the `type` field in
  // the closest `package.json`.
  try {
    const packageJSON = await getClosestPackageJson(dirname(mainFile), repositoryRoot)

    if (packageJSON?.contents.type === 'module') {
      return MODULE_FORMAT.ESM
    }
  } catch {
    // no-op
  }

  return MODULE_FORMAT.COMMONJS
}

export const getTransformer = async (
  runtimeAPIVersion: number,
  mainFile: string,
  repositoryRoot?: string,
): Promise<Transformer | undefined> => {
  const format = await getModuleFormat(mainFile, runtimeAPIVersion, repositoryRoot)
  const aliases = new Map<string, string>()
  const rewrites = new Map<string, string>()
  const transformer = {
    aliases,
    format,
    rewrites,
  }

  if (runtimeAPIVersion === 2) {
    // For V2 functions, we want to emit a main file with an unambiguous
    // extension (i.e. `.cjs` or `.mjs`), so that the file is loaded with
    // the correct format regardless of what is set in `package.json`.
    const newExtension = format === MODULE_FORMAT.COMMONJS ? MODULE_FILE_EXTENSION.CJS : MODULE_FILE_EXTENSION.MJS
    const newMainFile = getPathWithExtension(mainFile, newExtension)

    return {
      ...transformer,
      bundle: true,
      bundledPaths: [],
      newMainFile,
    }
  }

  return transformer
}

interface TransformOptions {
  bundle?: boolean
  config: FunctionConfig
  featureFlags: FeatureFlags
  format?: ModuleFormat
  name: string
  path: string
}

const CJS_VARIABLE_IN_ESM_WARNING = 'commonjs-variable-in-esm'

export const transform = async ({ bundle = false, config, featureFlags, format, name, path }: TransformOptions) => {
  // The version of ECMAScript to use as the build target. This will determine
  // whether certain features are transpiled down or left untransformed.
  const nodeTarget = getBundlerTarget(config.nodeVersion)
  const bundleOptions: BuildOptions = {
    bundle: false,
  }

  if (bundle) {
    bundleOptions.bundle = true
    bundleOptions.packages = 'external'

    if (format === MODULE_FORMAT.ESM) {
      bundleOptions.banner = { js: CJS_SHIM }
    }
  }

  try {
    const transpiled = await build({
      ...bundleOptions,
      entryPoints: [path],
      format,
      logLevel: 'error',
      metafile: true,
      platform: 'node',
      sourcemap: Boolean(config.nodeSourcemap),
      target: [nodeTarget],
      write: false,
    })

    if (featureFlags.zisi_error_cjs_in_esm_scope) {
      const cjsInESM = transpiled.warnings.find((warning) => warning.id === CJS_VARIABLE_IN_ESM_WARNING)

      if (cjsInESM !== undefined) {
        const file = cjsInESM.location?.file ?? path

        throw new FunctionBundlingUserError(
          `The file '${file}' is a CommonJS module, but the closest 'package.json' declares '"type": "module"', so Node.js will fail to load it at runtime. Either use ESM syntax ('import'/'export'), rename the file extension to '.cjs', or remove '"type": "module"' from the 'package.json'.`,
          { functionName: name, runtime: RUNTIME.JAVASCRIPT, bundler: NODE_BUNDLER.NFT },
        )
      }
    }

    const bundledPaths = bundle ? Object.keys(transpiled.metafile.inputs).map((inputPath) => resolve(inputPath)) : []

    return { bundledPaths, transpiled: transpiled.outputFiles[0].text }
  } catch (error) {
    throw FunctionBundlingUserError.addCustomErrorInfo(error, {
      functionName: name,
      runtime: RUNTIME.JAVASCRIPT,
      bundler: NODE_BUNDLER.NFT,
    })
  }
}
