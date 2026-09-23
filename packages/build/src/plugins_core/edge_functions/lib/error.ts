import { CUSTOM_ERROR_KEY, isBuildError } from '../../../error/info.js'

type CustomErrorInfo = {
  type?: unknown
  location?: object
}

// If we have a custom error tagged with `functionsBundling` (which happens if
// there is an issue with user code), we tag it as coming from an edge function
// so that we can adjust the downstream error messages accordingly.
export const tagBundlingError = (error: unknown): void => {
  if (!isBuildError(error)) {
    return
  }

  // `isBuildError()` checked that `error` holds error info, which `info.ts` leaves untyped
  const { [CUSTOM_ERROR_KEY]: errorInfo } = error as Record<typeof CUSTOM_ERROR_KEY, CustomErrorInfo>

  if (errorInfo.type !== 'functionsBundling') {
    return
  }

  errorInfo.location = {
    ...errorInfo.location,
    functionType: 'edge',
  }
}
