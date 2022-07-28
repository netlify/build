import { CUSTOM_ERROR_KEY, getErrorInfo, isBuildError } from '../../../error/info.js'

// If we have a custom error tagged with `functionsBundling` (which happens if
// there is an issue with user code), we tag it as coming from an edge function
// so that we can adjust the downstream error messages accordingly.
export const tagBundlingError = (error) => {
  if (!isBuildError(error)) {
    return
  }

  const [errorInfo = {}] = getErrorInfo(error)

  if (errorInfo.type !== 'functionsBundling') {
    return
  }

  error[CUSTOM_ERROR_KEY].location = {
    ...error[CUSTOM_ERROR_KEY].location,
    functionType: 'edge',
  }
}
