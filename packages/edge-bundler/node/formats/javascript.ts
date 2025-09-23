import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { pathToFileURL } from 'url'

import { EdgeFunction } from '../edge_function.js'
import type { FormatFunction } from '../server/server.js'

const defaultFormatExportTypeError: FormatFunction = (name) =>
  `The Edge Function "${name}" has failed to load. Does it have a function as the default export?`

const defaultFormatImportError: FormatFunction = (name) => `There was an error with Edge Function "${name}".`

interface GenerateStage2Options {
  bootstrapURL: string
  distDirectory: string
  fileName: string
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
  functions: EdgeFunction[]
}

const generateStage2 = async ({
  bootstrapURL,
  distDirectory,
  fileName,
  formatExportTypeError,
  formatImportError,
  functions,
}: GenerateStage2Options) => {
  await mkdir(distDirectory, { recursive: true })

  const entryPoint = getLocalEntryPoint(functions, { bootstrapURL, formatExportTypeError, formatImportError })
  const stage2Path = join(distDirectory, fileName)

  await writeFile(stage2Path, entryPoint)

  return stage2Path
}

interface GetLocalEntryPointOptions {
  bootstrapURL: string
  formatExportTypeError?: FormatFunction
  formatImportError?: FormatFunction
}

// For the local development environment, we import the user functions with
// dynamic imports to gracefully handle the case where the file doesn't have
// a valid default export.
const getLocalEntryPoint = (
  functions: EdgeFunction[],
  {
    bootstrapURL,
    formatExportTypeError = defaultFormatExportTypeError,
    formatImportError = defaultFormatImportError,
  }: GetLocalEntryPointOptions,
) => {
  const bootImport = `import { boot } from "${bootstrapURL}";`
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
  const bootCall = `boot(() => Promise.resolve(functions));`

  return [bootImport, declaration, ...imports, bootCall].join('\n\n')
}

export { generateStage2, getLocalEntryPoint }
