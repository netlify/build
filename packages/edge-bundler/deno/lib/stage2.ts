import { build, LoadResponse } from 'https://deno.land/x/eszip@v0.55.2/mod.ts'

import * as path from 'https://deno.land/std@0.177.0/path/mod.ts'

import type { InputFunction, WriteStage2Options } from '../../shared/stage2.ts'
import { importMapSpecifier, virtualRoot, virtualVendorRoot } from '../../shared/consts.ts'
import { LEGACY_PUBLIC_SPECIFIER, PUBLIC_SPECIFIER, STAGE2_SPECIFIER } from './consts.ts'
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

const stage2Loader = (
  basePath: string,
  functions: InputFunction[],
  externals: Set<string>,
  importMapData: string | undefined,
  vendorDirectory?: string,
) => {
  return async (specifier: string): Promise<LoadResponse | undefined> => {
    if (specifier === STAGE2_SPECIFIER) {
      const stage2Entry = getStage2Entry(basePath, functions)

      return inlineModule(specifier, stage2Entry)
    }

    if (specifier === importMapSpecifier && importMapData !== undefined) {
      return inlineModule(specifier, importMapData)
    }

    if (
      specifier === LEGACY_PUBLIC_SPECIFIER ||
      specifier === PUBLIC_SPECIFIER ||
      externals.has(specifier) ||
      specifier.startsWith('node:')
    ) {
      return {
        kind: 'external',
        specifier,
      }
    }

    if (specifier.startsWith(virtualRoot)) {
      return loadFromVirtualRoot(specifier, virtualRoot, basePath)
    }

    if (vendorDirectory !== undefined && specifier.startsWith(virtualVendorRoot)) {
      return loadFromVirtualRoot(specifier, virtualVendorRoot, vendorDirectory)
    }

    return await loadWithRetry(specifier)
  }
}

export const writeStage2 = async ({
  basePath,
  destPath,
  externals,
  functions,
  importMapData,
  vendorDirectory,
}: WriteStage2Options) => {
  const importMapURL = importMapData ? importMapSpecifier : undefined
  const loader = stage2Loader(basePath, functions, new Set(externals), importMapData, vendorDirectory)
  const bytes = await build([STAGE2_SPECIFIER], loader, importMapURL)
  const directory = path.dirname(destPath)

  await Deno.mkdir(directory, { recursive: true })

  return await Deno.writeFile(destPath, bytes)
}
