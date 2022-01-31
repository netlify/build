import { promises as fs } from 'fs'
import { join, relative } from 'path'

import { findHandlers } from './finder.js'
import { Handler } from './handler.js'
import { getStringHash } from './utils/sha256.js'

interface HandlerLine {
  exportLine: string
  importLine: string
}

const bundle = async (sourceDirectories: string[], distDirectory: string) => {
  await fs.mkdir(distDirectory, { recursive: true })

  const handlers = await findHandlers(sourceDirectories)
  const lines = handlers.map((handler, index) => generateHandlerReference(handler, index, distDirectory))
  const bundleContents = generateBundle(lines)
  const hash = await getStringHash(bundleContents)
  const preBundlePath = join(distDirectory, `${hash}-pre.ts`)
  const bundlePath = join(distDirectory, `${hash}.ts`)

  await fs.writeFile(preBundlePath, bundleContents)

  return { handlers, preBundlePath, bundlePath }
}

const generateBundle = (lines: HandlerLine[]) => {
  const importLines = lines.map(({ importLine }) => importLine).join('\n')
  const exportLines = lines.map(({ exportLine }) => exportLine).join(', ')
  const exportDeclaration = `const handlers = {${exportLines}};`

  return `${importLines}\n\n${exportDeclaration}\n\nexport default handlers;`
}

const generateHandlerReference = (handler: Handler, index: number, targetDirectory: string): HandlerLine => {
  const importName = `handler${index}`
  const exportLine = `"${handler.name}": ${importName}.handler`
  const relativePath = relative(targetDirectory, handler.path)

  return {
    exportLine,
    importLine: `import * as ${importName} from "${relativePath}";`,
  }
}

export { bundle }
