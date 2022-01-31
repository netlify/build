import { promises as fs } from 'fs'
import { basename, extname, join } from 'path'

import { Handler } from './handler.js'
import { nonNullable } from './utils/non_nullable.js'

const ALLOWED_EXTENSIONS = new Set(['.js', '.ts'])

const findHandlerInDirectory = async (directory: string): Promise<Handler | undefined> => {
  const name = basename(directory)
  const candidatePaths = [`${name}.js`, `index.js`, `${name}.ts`, `index.ts`].map((filename) =>
    join(directory, filename),
  )

  let handlerPath

  for (const candidatePath of candidatePaths) {
    try {
      const stats = await fs.stat(candidatePath)

      // eslint-disable-next-line max-depth
      if (stats.isFile()) {
        handlerPath = candidatePath

        break
      }
    } catch {
      // no-op
    }
  }

  if (handlerPath === undefined) {
    return
  }

  return {
    name,
    path: handlerPath,
  }
}

const findHandlerInPath = async (path: string): Promise<Handler | undefined> => {
  const stats = await fs.stat(path)

  if (stats.isDirectory()) {
    return findHandlerInDirectory(path)
  }

  const extension = extname(path)

  if (ALLOWED_EXTENSIONS.has(extension)) {
    return { name: basename(path, extension), path }
  }
}

const findHandlersInDirectory = async (baseDirectory: string) => {
  let items: string[] = []

  try {
    items = await fs.readdir(baseDirectory)
  } catch {
    // no-op
  }

  const handlers = await Promise.all(items.map((item) => findHandlerInPath(join(baseDirectory, item))))

  return handlers.filter(nonNullable)
}

const findHandlers = async (directories: string[]) => {
  const handlers = await Promise.all(directories.map(findHandlersInDirectory))

  return handlers.flat()
}

export { findHandlers }
