import { promises as fs } from 'fs'
import { relative } from 'path'

import { listFunctions } from '@netlify/zip-it-and-ship-it'

import type { FeatureFlags } from '../../core/feature_flags.js'
import { addErrorInfo } from '../../error/info.js'

import { getZisiFeatureFlags } from './feature_flags.js'

// Returns the `mainFile` of each function found in `functionsSrc`, relative to
// `functionsSrc`.
const getRelativeFunctionMainFiles = async function ({
  featureFlags,
  functionsSrc,
}: {
  featureFlags: FeatureFlags
  functionsSrc: string | undefined
}): Promise<string[]> {
  if (functionsSrc === undefined) {
    return []
  }

  const zisiFeatureFlags = getZisiFeatureFlags(featureFlags)
  const functions = await listFunctions(functionsSrc, { featureFlags: zisiFeatureFlags })
  const dedupedFunctions = new Map(functions.map((func) => [func.name, func]))
  const relativeMainFiles = [...dedupedFunctions.values()].map(({ mainFile }) => relative(functionsSrc, mainFile))
  return relativeMainFiles
}

export const getUserAndInternalFunctions = ({
  featureFlags,
  functionsSrc,
  functionsSrcExists,
  internalFunctionsSrc,
  internalFunctionsSrcExists,
  frameworkFunctionsSrc,
  frameworkFunctionsSrcExists,
}: {
  featureFlags: FeatureFlags
  functionsSrc: string | undefined
  functionsSrcExists: boolean
  internalFunctionsSrc: string
  internalFunctionsSrcExists: boolean
  frameworkFunctionsSrc: string
  frameworkFunctionsSrcExists: boolean
}): Promise<(string[] | undefined)[]> => {
  const paths = [
    functionsSrcExists ? functionsSrc : undefined,
    internalFunctionsSrcExists ? internalFunctionsSrc : undefined,
    frameworkFunctionsSrcExists ? frameworkFunctionsSrc : undefined,
  ]

  // Every path is either `undefined` or an absolute path, so never an empty string
  return Promise.all(
    paths.map((path) =>
      path === undefined
        ? Promise.resolve(undefined)
        : getRelativeFunctionMainFiles({ featureFlags, functionsSrc: path }),
    ),
  )
}

// Returns `true` if the functions directory exists and is valid. Returns
// `false` if it doesn't exist. Throws an error if it's invalid or can't
// be accessed.
export const validateFunctionsSrc = async function ({
  functionsSrc,
  relativeFunctionsSrc,
}: {
  functionsSrc: string | undefined
  relativeFunctionsSrc: string | undefined
}): Promise<boolean> {
  if (functionsSrc === undefined) {
    return false
  }

  try {
    const stats = await fs.stat(functionsSrc)

    if (stats.isDirectory()) {
      return true
    }

    const error = new Error(
      `The Netlify Functions setting should target a directory, not a regular file: ${String(relativeFunctionsSrc)}`,
    )

    addErrorInfo(error, { type: 'resolveConfig' })

    throw error
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return false
    }

    throw error
  }
}
