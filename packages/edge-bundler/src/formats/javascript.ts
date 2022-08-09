import { promises as fs } from 'fs'
import { join } from 'path'
import { env } from 'process'
import { pathToFileURL } from 'url'

import del from 'del'

import { DenoBridge } from '../bridge.js'
import type { Bundle } from '../bundle.js'
import { wrapBundleError } from '../bundle_error.js'
import { EdgeFunction } from '../edge_function.js'
import { ImportMap } from '../import_map.js'
import type { FormatFunction } from '../server/server.js'
import { getFileHash } from '../utils/sha256.js'

const BOOTSTRAP_LATEST = 'https://62ea8d05a6858300091547ed--edge.netlify.com/bootstrap/index-combined.ts'

interface BundleJSOptions {
  buildID: string
  debug?: boolean
  deno: DenoBridge
  distDirectory: string
  functions: EdgeFunction[]
  importMap: ImportMap
}

const bundleJS = async ({
  buildID,
  debug,
  deno,
  distDirectory,
  functions,
  importMap,
}: BundleJSOptions): Promise<Bundle> => {
  const stage2Path = await generateStage2({ distDirectory, functions, fileName: `${buildID}-pre.js` })
  const extension = '.js'
  const jsBundlePath = join(distDirectory, `${buildID}${extension}`)
  const flags = [`--import-map=${importMap.toDataURL()}`]

  if (!debug) {
    flags.push('--quiet')
  }

  try {
    await deno.run(['bundle', ...flags, stage2Path, jsBundlePath], { pipeOutput: true })
  } catch (error: unknown) {
    throw wrapBundleError(error, { format: 'javascript' })
  }

  await fs.unlink(stage2Path)

  const hash = await getFileHash(jsBundlePath)

  return { extension, format: 'js', hash }
}

const defaultFormatExportTypeError: FormatFunction = (name) =>
  `The Edge Function "${name}" has failed to load. Does it have a function as the default export?`

const defaultFormatImpoortError: FormatFunction = (name) => `There was an error with Edge Function "${name}".`

interface GenerateStage2Options {
  distDirectory: string
  fileName: string
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
  functions: EdgeFunction[]
  type?: 'local' | 'production'
}

const generateStage2 = async ({
  distDirectory,
  fileName,
  formatExportTypeError,
  formatImportError,
  functions,
  type = 'production',
}: GenerateStage2Options) => {
  await del(distDirectory, { force: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const entryPoint =
    type === 'local'
      ? getLocalEntryPoint(functions, { formatExportTypeError, formatImportError })
      : getProductionEntryPoint(functions)
  const stage2Path = join(distDirectory, fileName)

  await fs.writeFile(stage2Path, entryPoint)

  return stage2Path
}

const getBootstrapURL = () => env.NETLIFY_EDGE_BOOTSTRAP ?? BOOTSTRAP_LATEST

interface GetLocalEntryPointOptions {
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
}

// For the local development environment, we import the user functions with
// dynamic imports to gracefully handle the case where the file doesn't have
// a valid default export.
const getLocalEntryPoint = (
  functions: EdgeFunction[],
  {
    formatExportTypeError = defaultFormatExportTypeError,
    formatImportError = defaultFormatImpoortError,
  }: GetLocalEntryPointOptions,
) => {
  const bootImport = `import { boot } from "${getBootstrapURL()}";`
  const declaration = `const functions = {};`
  const imports = functions.map(
    (func) => `
  try {
    const { default: func } = await import("${pathToFileURL(func.path)}");

    if (typeof func === "function") {
      functions["${func.name}"] = func;
    } else {
      console.log(${JSON.stringify(formatExportTypeError(func.name))});
    }
  } catch (error) {
    console.log(${JSON.stringify(formatImportError(func.name))});
    console.error(error);
  }
  `,
  )
  const bootCall = `boot(functions);`

  return [bootImport, declaration, ...imports, bootCall].join('\n\n')
}

const getProductionEntryPoint = (functions: EdgeFunction[]) => {
  const bootImport = `import { boot } from "${getBootstrapURL()}";`
  const lines = functions.map((func, index) => {
    const importName = `func${index}`
    const exportLine = `"${func.name}": ${importName}`
    const url = pathToFileURL(func.path)

    return {
      exportLine,
      importLine: `import ${importName} from "${url}";`,
    }
  })
  const importLines = lines.map(({ importLine }) => importLine).join('\n')
  const exportLines = lines.map(({ exportLine }) => exportLine).join(', ')
  const exportDeclaration = `const functions = {${exportLines}};`
  const defaultExport = 'boot(functions);'

  return [bootImport, importLines, exportDeclaration, defaultExport].join('\n\n')
}

export { bundleJS as bundle, generateStage2, getBootstrapURL }
