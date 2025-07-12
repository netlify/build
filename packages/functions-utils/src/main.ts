import { basename, dirname, join } from 'path'
import { access, stat } from 'fs/promises'

import { listFunctions, listFunctionsFiles } from '@netlify/zip-it-and-ship-it'
import cpy from 'cpy'

interface FailOptions {
  fail?: (message: string, options?: { error?: unknown }) => void
}

// Add a Netlify Function file to the `functions` directory, so it is processed
// by `@netlify/plugin-functions-core`
export const add = async function (
  src?: string,
  dist?: string,
  { fail = defaultFail }: FailOptions = {},
): Promise<void> {
  if (src === undefined) {
    fail('No function source directory was specified')
    return
  }

  try {
    await access(src)
  } catch {
    fail(`No function file or directory found at "${src}"`)
    return
  }

  if (dist === undefined) {
    fail('No function directory was specified')
    return
  }

  const srcBasename = basename(src)
  const [srcGlob, dest] = await getSrcAndDest(src, srcBasename, dist)
  await cpy(srcGlob, dest, { cwd: dirname(src), overwrite: true })
}

const getSrcAndDest = async function (src: string, srcBasename: string, dist: string): Promise<[string, string]> {
  const srcStat = await stat(src)

  if (srcStat.isDirectory()) {
    return [`${srcBasename}/**`, join(dist, srcBasename)]
  }

  return [srcBasename, dist]
}

export const list = async function (functionsSrc: string | string[], { fail = defaultFail }: FailOptions = {}) {
  if (Array.isArray(functionsSrc) ? functionsSrc.length === 0 : !functionsSrc) {
    fail('No function directory was specified')
    return
  }

  try {
    return await listFunctions(functionsSrc)
  } catch (error) {
    fail('Could not list Netlify Functions', { error })
  }
}

export const listAll = async function (functionsSrc: string | string[], { fail = defaultFail }: FailOptions = {}) {
  if (Array.isArray(functionsSrc) ? functionsSrc.length === 0 : !functionsSrc) {
    fail('No function directory was specified')
    return
  }

  try {
    return await listFunctionsFiles(functionsSrc)
  } catch (error) {
    fail('Could not list Netlify Functions files', { error })
  }
}

const defaultFail = function (message: string): never {
  throw new Error(message)
}
