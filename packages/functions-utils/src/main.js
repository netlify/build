import { promises as fs } from 'fs'
import { basename, dirname } from 'path'

import { listFunctions, listFunctionsFiles } from '@netlify/zip-it-and-ship-it'
import cpy from 'cpy'
import { pathExists } from 'path-exists'

// Add a Netlify Function file to the `functions` directory so it is processed
// by `@netlify/plugin-functions-core`
export const add = async function (src, dist, { fail = defaultFail } = {}) {
  if (src === undefined) {
    return fail('No function source directory was specified')
  }

  if (!(await pathExists(src))) {
    return fail(`No function file or directory found at "${src}"`)
  }

  if (dist === undefined) {
    return fail('No function directory was specified')
  }

  const srcBasename = basename(src)
  const srcGlob = await getSrcGlob(src, srcBasename)
  await cpy(srcGlob, dist, { cwd: dirname(src), parents: true, overwrite: true })
}

const getSrcGlob = async function (src, srcBasename) {
  const srcStat = await fs.stat(src)

  if (srcStat.isDirectory()) {
    return `${srcBasename}/**`
  }

  return srcBasename
}

export const list = async function (functionsSrc, { fail = defaultFail } = {}) {
  if (functionsSrc === undefined || functionsSrc.length === 0) {
    return fail('No function directory was specified')
  }

  try {
    return await listFunctions(functionsSrc)
  } catch (error) {
    fail('Could not list Netlify Functions', { error })
  }
}

export const listAll = async function (functionsSrc, { fail = defaultFail } = {}) {
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
