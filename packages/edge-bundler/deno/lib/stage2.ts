import { build, LoadResponse } from 'https://deno.land/x/eszip@v0.18.0/mod.ts'

import * as path from 'https://deno.land/std@0.127.0/path/mod.ts'

import { PUBLIC_SPECIFIER, STAGE2_SPECIFIER, virtualRoot } from './consts.ts'
import { inlineModule, loadFromVirtualRoot, loadWithRetry } from './common.ts'

interface InputFunction {
  name: string
  path: string
}

interface WriteStage2Options {
  basePath: string
  destPath: string
  functions: InputFunction[]
  imports?: Record<string, string>
}

const getFunctionReference = (basePath: string, func: InputFunction, index: number) => {
  const importName = `func${index}`
  const exportLine = `"${func.name}": ${importName}`
  const url = getVirtualPath(basePath, func.path)

  return {
    exportLine,
    importLine: `import ${importName} from "${url}";`,
  }
}

const getStage2Entry = (basePath: string, functions: InputFunction[]) => {
  const lines = functions.map((func, index) => getFunctionReference(basePath, func, index))
  const importLines = lines.map(({ importLine }) => importLine).join('\n')
  const exportLines = lines.map(({ exportLine }) => exportLine).join(', ')
  const exportDeclaration = `export const functions = {${exportLines}};`

  return [importLines, exportDeclaration].join('\n\n')
}

const getVirtualPath = (basePath: string, filePath: string) => {
  const relativePath = path.relative(basePath, filePath)
  const url = new URL(relativePath, virtualRoot)

  return url
}

const stage2Loader = (basePath: string, functions: InputFunction[], imports: Record<string, string> = {}) => {
  return async (specifier: string): Promise<LoadResponse | undefined> => {
    if (specifier === STAGE2_SPECIFIER) {
      const stage2Entry = getStage2Entry(basePath, functions)

      return inlineModule(specifier, stage2Entry)
    }

    if (specifier === PUBLIC_SPECIFIER) {
      return {
        kind: 'external',
        specifier,
      }
    }

    if (imports[specifier] !== undefined) {
      return await loadWithRetry(imports[specifier])
    }

    if (specifier.startsWith(virtualRoot)) {
      return loadFromVirtualRoot(specifier, virtualRoot, basePath)
    }

    return await loadWithRetry(specifier)
  }
}

const writeStage2 = async ({ basePath, destPath, functions, imports }: WriteStage2Options) => {
  const loader = stage2Loader(basePath, functions, imports)
  const bytes = await build([STAGE2_SPECIFIER], loader)

  return await Deno.writeFile(destPath, bytes)
}

export { writeStage2 }
