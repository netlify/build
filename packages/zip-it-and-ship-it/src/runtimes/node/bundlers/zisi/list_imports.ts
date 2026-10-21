import precinct from 'precinct'

import { FeatureFlags } from '../../../../feature_flags.js'
import { FunctionBundlingUserError } from '../../../../utils/error.js'
import { RUNTIME } from '../../../runtime.js'
import { NODE_BUNDLER } from '../types.js'

const listImportsWithPrecinct = async ({ functionName, path }: { functionName: string; path: string }) => {
  try {
    return await precinct.paperwork(path, { includeCore: false })
  } catch (error) {
    // Syntax errors from babel are user errors
    if (error.code === 'BABEL_PARSER_SYNTAX_ERROR') {
      throw FunctionBundlingUserError.addCustomErrorInfo(error, {
        functionName,
        runtime: RUNTIME.JAVASCRIPT,
        bundler: NODE_BUNDLER.ZISI,
      })
    }

    throw error
  }
}

export const listImports = async ({
  featureFlags,
  ...args
}: {
  featureFlags: FeatureFlags
  functionName: string
  path: string
}) => await listImportsWithPrecinct(args)
