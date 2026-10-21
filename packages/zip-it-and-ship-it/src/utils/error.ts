import type { NodeBundlerName } from '../runtimes/node/bundlers/types.js'
import type { RuntimeName } from '../runtimes/runtime.js'

interface CustomErrorLocation {
  functionName: string
  runtime: RuntimeName
  bundler?: NodeBundlerName
}

interface CustomErrorInfo {
  type: 'functionsBundling'
  location: CustomErrorLocation
}

type UserError = Error & { customErrorInfo: CustomErrorInfo }

const createFunctionsBundlingErrorInfo = (location: CustomErrorLocation): CustomErrorInfo => ({
  type: 'functionsBundling',
  location,
})

export class FunctionBundlingUserError extends Error {
  customErrorInfo: CustomErrorInfo

  constructor(message: string, customErrorInfo: CustomErrorLocation) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'FunctionBundlingUserError'
    Error.captureStackTrace(this, FunctionBundlingUserError)

    this.customErrorInfo = createFunctionsBundlingErrorInfo(customErrorInfo)
  }

  static addCustomErrorInfo(error: Error, customErrorInfo: CustomErrorLocation): UserError {
    ;(error as UserError).customErrorInfo = createFunctionsBundlingErrorInfo(customErrorInfo)

    return error as UserError
  }
}
