// Deno subprocesses fetch remote modules and npm registry metadata, so they can fail for reasons
// that have nothing to do with the user's code: a dropped connection, a DNS blip, a registry
// timeout. These are the messages Deno surfaces for those failures. Anything else (a syntax error,
// an unresolvable import) is deterministic, and retrying it just delays the real error.
const TRANSIENT_DENO_ERRORS = [
  'error sending request',
  'error reading a body from connection',
  'connection closed before message completed',
  'connection reset',
  'operation timed out',
  'tcp connect error',
  'dns error',
]

export const isTransientDenoError = (output: string) => {
  const haystack = output.toLowerCase()

  return TRANSIENT_DENO_ERRORS.some((pattern) => haystack.includes(pattern))
}

// execa folds stderr into `message`, which is where Deno writes the `Caused by:` detail.
export const isTransientDenoErrorObject = (error: unknown) =>
  error instanceof Error && isTransientDenoError(error.message)

export const DENO_RETRIES = 3
