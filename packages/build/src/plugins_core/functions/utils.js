import { promises as fs } from 'fs'
import { relative } from 'path'

import { listFunctions } from '@netlify/zip-it-and-ship-it'

import { addErrorInfo } from '../../error/info.js'

import { getZisiFeatureFlags } from './feature_flags.js'

// Returns the `mainFile` of each function found in `functionsSrc`, relative to
// `functionsSrc`.
const getRelativeFunctionMainFiles = async function ({ featureFlags, functionsSrc }) {
  if (functionsSrc === undefined) {
    return []
  }

  const zisiFeatureFlags = getZisiFeatureFlags(featureFlags)
  const functions = await listFunctions(functionsSrc, { featureFlags: zisiFeatureFlags })
  return functions.map(({ mainFile }) => relative(functionsSrc, mainFile))
}

export const getUserAndInternalFunctions = ({
  featureFlags,
  functionsSrc,
  functionsSrcExists,
  internalFunctionsSrc,
  internalFunctionsSrcExists,
}) => {
  const paths = [
    functionsSrcExists ? functionsSrc : undefined,
    internalFunctionsSrcExists ? internalFunctionsSrc : undefined,
  ]

  return Promise.all(paths.map((path) => path && getRelativeFunctionMainFiles({ featureFlags, functionsSrc: path })))
}

// Returns `true` if the functions directory exists and is valid. Returns
// `false` if it doesn't exist. Throws an error if it's invalid or can't
// be accessed.
export const validateFunctionsSrc = async function ({ functionsSrc, relativeFunctionsSrc }) {
  if (functionsSrc === undefined) {
    return false
  }

  try {
    const stats = await fs.stat(functionsSrc)

    if (stats.isDirectory()) {
      return true
    }

    const error = new Error(
      `The Netlify Functions setting should target a directory, not a regular file: ${relativeFunctionsSrc}`,
    )

    addErrorInfo(error, { type: 'resolveConfig' })

    throw error
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    }

    throw error
  }
}
