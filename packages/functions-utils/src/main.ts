import { promises as fs } from 'fs'
import { access } from 'fs/promises'
import { basename, dirname, join } from 'path'

import { listFunctions, listFunctionsFiles } from '@netlify/zip-it-and-ship-it'
import cpy from 'cpy'

// Add a Netlify Function file to the `functions` directory, so it is processed
// by `@netlify/plugin-functions-core`
export const add = async function (src?: string, dist?: string, { fail = defaultFail } = {}): Promise<void> {
  if (src === undefined) {
    return fail('No function source directory was specified')
  }

  try {
    await access(src)
  } catch {
    return fail(`No function file or directory found at "${src}"`)
  }

  if (dist === undefined) {
    return fail('No function directory was specified')
  }

  const srcBasename = basename(src)
  const [srcGlob, dest] = await getSrcAndDest(src, srcBasename, dist)
  await cpy(srcGlob, dest, { cwd: dirname(src), overwrite: true })
}

const getSrcAndDest = async function (src: string, srcBasename: string, dist: string): Promise<[string, string]> {
  const srcStat = await fs.stat(src)

  if (srcStat.isDirectory()) {
    return [`${srcBasename}/**`, join(dist, srcBasename)]
  }

  return [srcBasename, dist]
}

export const list = async function (functionsSrc, { fail = defaultFail } = {} as any) {
  if (functionsSrc === undefined || functionsSrc.length === 0) {
    return fail('No function directory was specified')
  }

  try {
    return await listFunctions(functionsSrc)
  } catch (error) {
    fail('Could not list Netlify Functions', { error })
  }
}

export const listAll = async function (functionsSrc, { fail = defaultFail } = {} as any) {
  if (functionsSrc === undefined || functionsSrc.length === 0) {
    return fail('No function directory was specified')
  }

  try {
    return await listFunctionsFiles(functionsSrc)
  } catch (error) {
    fail('Could not list Netlify Functions files', { error })
  }
}

const defaultFail = function (message) {
  throw new Error(message)
}
