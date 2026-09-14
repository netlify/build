import { promises as fs } from 'fs'
import { basename, join } from 'path'

import { listFunctions, listFunctionsFiles } from '@netlify/zip-it-and-ship-it'
import { isNotJunk } from 'junk'

// Add a Netlify Function file to the `functions` directory, so it is processed
// by `@netlify/plugin-functions-core`
export const add = async function (src?: string, dist?: string, { fail = defaultFail } = {}): Promise<void> {
  if (src === undefined) {
    return fail('No function source directory was specified')
  }

  try {
    await fs.access(src)
  } catch {
    return fail(`No function file or directory found at "${src}"`)
  }

  if (dist === undefined) {
    return fail('No function directory was specified')
  }

  await fs.cp(src, join(dist, basename(src)), {
    recursive: true,
    force: true,
    filter: (source) => isNotJunk(basename(source)),
  })
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
