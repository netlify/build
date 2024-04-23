import { promises as fs } from 'fs'
import { basename, extname, join, parse } from 'path'

import { EdgeFunction } from './edge_function.js'
import { nonNullable } from './utils/non_nullable.js'

// the order of the allowed extensions is also the order we remove duplicates
// with a lower index meaning a higher precedence over the others
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.mjs', '.mts', '.ts', '.tsx']

export const removeDuplicatesByExtension = (functions: string[]) => {
  const seen = new Map()

  return Object.values(
    functions.reduce((acc, path) => {
      const { ext, name } = parse(path)
      const extIndex = ALLOWED_EXTENSIONS.indexOf(ext)

      if (!seen.has(name) || seen.get(name) > extIndex) {
        seen.set(name, extIndex)
        return { ...acc, [name]: path }
      }

      return acc
    }, {}),
  ) as string[]
}

const findFunctionInDirectory = async (directory: string): Promise<EdgeFunction | undefined> => {
  const name = basename(directory)
  const candidatePaths = ALLOWED_EXTENSIONS.flatMap((extension) => [`${name}${extension}`, `index${extension}`]).map(
    (filename) => join(directory, filename),
  )

  let functionPath

  for (const candidatePath of candidatePaths) {
    try {
      const stats = await fs.stat(candidatePath)

      if (stats.isFile()) {
        functionPath = candidatePath

        break
      }
    } catch {
      // no-op
    }
  }

  if (functionPath === undefined) {
    return
  }

  return {
    name,
    path: functionPath,
  }
}

const findFunctionInPath = async (path: string): Promise<EdgeFunction | undefined> => {
  const stats = await fs.stat(path)

  if (stats.isDirectory()) {
    return findFunctionInDirectory(path)
  }

  const extension = extname(path)

  if (ALLOWED_EXTENSIONS.includes(extension)) {
    return { name: basename(path, extension), path }
  }
}

const findFunctionsInDirectory = async (baseDirectory: string) => {
  let items: string[] = []

  try {
    items = await fs.readdir(baseDirectory).then(removeDuplicatesByExtension)
  } catch {
    // no-op
  }

  const functions = await Promise.all(items.map((item) => findFunctionInPath(join(baseDirectory, item))))

  return functions.filter(nonNullable)
}

const findFunctions = async (directories: string[]) => {
  const functions = await Promise.all(directories.map(findFunctionsInDirectory))

  return functions.flat()
}

export { findFunctions }
