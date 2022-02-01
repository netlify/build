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
  await fs.rm(distDirectory, { force: true, recursive: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const handlers = await findHandlers(sourceDirectories)
  const lines = handlers.map((handler, index) => generateHandlerReference(handler, index, distDirectory))
  const entrypoint = generateEntrypoint(lines)
  const hash = await getStringHash(entrypoint)
  const preBundlePath = join(distDirectory, `${hash}-pre.js`)
  const bundlePath = join(distDirectory, `${hash}.js`)

  await fs.writeFile(preBundlePath, entrypoint)

  return { handlers, preBundlePath, bundlePath }
}

const generateEntrypoint = (lines: HandlerLine[]) => {
  const bootImport = 'import { boot } from "https://dinosaurs:are-the-future!@edge-bootstrap.netlify.app/index.ts";'
  const importLines = lines.map(({ importLine }) => importLine).join('\n')
  const exportLines = lines.map(({ exportLine }) => exportLine).join(', ')
  const exportDeclaration = `const handlers = {${exportLines}};`
  const defaultExport = 'boot(handlers);'

  return [bootImport, importLines, exportDeclaration, defaultExport].join('\n\n')
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
