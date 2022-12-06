import { promises as fs } from 'fs'
import { join } from 'path'
import { env } from 'process'
import { pathToFileURL } from 'url'

import { deleteAsync } from 'del'

import { EdgeFunction } from '../edge_function.js'
import type { FormatFunction } from '../server/server.js'

const BOOTSTRAP_LATEST = 'https://638f0e00dc20510008d6a1f4--edge.netlify.com/bootstrap/index-combined.ts'

const defaultFormatExportTypeError: FormatFunction = (name) =>
  `The Edge Function "${name}" has failed to load. Does it have a function as the default export?`

const defaultFormatImpoortError: FormatFunction = (name) => `There was an error with Edge Function "${name}".`

interface GenerateStage2Options {
  distDirectory: string
  fileName: string
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
  functions: EdgeFunction[]
}

const generateStage2 = async ({
  distDirectory,
  fileName,
  formatExportTypeError,
  formatImportError,
  functions,
}: GenerateStage2Options) => {
  await deleteAsync(distDirectory, { force: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const entryPoint = getLocalEntryPoint(functions, { formatExportTypeError, formatImportError })
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
  const declaration = `const functions = {}; const metadata = { functions: {} };`
  const imports = functions.map((func) => {
    const url = pathToFileURL(func.path)
    const metadata = {
      url,
    }

    return `
      try {
        const { default: func } = await import("${url}");

        if (typeof func === "function") {
          functions["${func.name}"] = func;
          metadata.functions["${func.name}"] = ${JSON.stringify(metadata)}
        } else {
          console.log(${JSON.stringify(formatExportTypeError(func.name))});
        }
      } catch (error) {
        console.log(${JSON.stringify(formatImportError(func.name))});
        console.error(error);
      }
      `
  })
  const bootCall = `boot(functions, metadata);`

  return [bootImport, declaration, ...imports, bootCall].join('\n\n')
}

export { generateStage2, getBootstrapURL, getLocalEntryPoint }
