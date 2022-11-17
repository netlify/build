import { build, LoadResponse } from 'https://deno.land/x/eszip@v0.28.0/mod.ts'

import * as path from 'https://deno.land/std@0.127.0/path/mod.ts'

import type { InputFunction, WriteStage2Options } from '../../shared/stage2.ts'
import { CUSTOM_LAYER_PREFIX, PUBLIC_SPECIFIER, STAGE2_SPECIFIER, virtualRoot } from './consts.ts'
import { inlineModule, loadFromVirtualRoot, loadWithRetry } from './common.ts'

interface FunctionReference {
  exportLine: string
  importLine: string
  metadata: {
    url: URL
  }
  name: string
}

const getMetadata = (references: FunctionReference[]) => {
  const functions = references.reduce(
    (acc, { metadata, name }) => ({
      ...acc,
      [name]: metadata,
    }),
    {},
  )

  return {
    functions,
  }
}

const getFunctionReference = (basePath: string, func: InputFunction, index: number): FunctionReference => {
  const importName = `func${index}`
  const exportLine = `"${func.name}": ${importName}`
  const url = getVirtualPath(basePath, func.path)

  return {
    exportLine,
    importLine: `import ${importName} from "${url}";`,
    metadata: {
      url,
    },
    name: func.name,
  }
}

export const getStage2Entry = (basePath: string, functions: InputFunction[]) => {
  const lines = functions.map((func, index) => getFunctionReference(basePath, func, index))
  const importLines = lines.map(({ importLine }) => importLine).join('\n')
  const exportLines = lines.map(({ exportLine }) => exportLine).join(', ')
  const metadata = getMetadata(lines)
  const functionsExport = `export const functions = {${exportLines}};`
  const metadataExport = `export const metadata = ${JSON.stringify(metadata)};`

  return [importLines, functionsExport, metadataExport].join('\n\n')
}

const getVirtualPath = (basePath: string, filePath: string) => {
  const relativePath = path.relative(basePath, filePath)
  const url = new URL(relativePath, virtualRoot)

  return url
}

const stage2Loader = (basePath: string, functions: InputFunction[]) => {
  return async (specifier: string): Promise<LoadResponse | undefined> => {
    if (specifier === STAGE2_SPECIFIER) {
      const stage2Entry = getStage2Entry(basePath, functions)

      return inlineModule(specifier, stage2Entry)
    }

    if (specifier === PUBLIC_SPECIFIER || specifier.startsWith(CUSTOM_LAYER_PREFIX)) {
      return {
        kind: 'external',
        specifier,
      }
    }

    if (specifier.startsWith(virtualRoot)) {
      return loadFromVirtualRoot(specifier, virtualRoot, basePath)
    }

    return await loadWithRetry(specifier)
  }
}

const writeStage2 = async ({ basePath, destPath, functions, importMapURL }: WriteStage2Options) => {
  const loader = stage2Loader(basePath, functions)
  const bytes = await build([STAGE2_SPECIFIER], loader, importMapURL)
  const directory = path.dirname(destPath)

  await Deno.mkdir(directory, { recursive: true })

  return await Deno.writeFile(destPath, bytes)
}

export { writeStage2 }
