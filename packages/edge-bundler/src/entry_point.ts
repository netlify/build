import { pathToFileURL } from 'url'

import { getBootstrapImport } from './bootstrap.js'
import { EdgeFunction } from './edge_function.js'

interface FunctionLine {
  exportLine: string
  importLine: string
}

const generateEntryPoint = (functions: EdgeFunction[]) => {
  const lines = functions.map((func, index) => generateFunctionReference(func, index))
  const bootImport = getBootstrapImport()
  const importLines = lines.map(({ importLine }) => importLine).join('\n')
  const exportLines = lines.map(({ exportLine }) => exportLine).join(', ')
  const exportDeclaration = `const functions = {${exportLines}};`
  const defaultExport = 'boot(functions);'

  return [bootImport, importLines, exportDeclaration, defaultExport].join('\n\n')
}

const generateFunctionReference = (func: EdgeFunction, index: number): FunctionLine => {
  const importName = `func${index}`
  const exportLine = `"${func.name}": ${importName}`
  const url = pathToFileURL(func.path)

  return {
    exportLine,
    importLine: `import ${importName} from "${url}";`,
  }
}

export { generateEntryPoint }
