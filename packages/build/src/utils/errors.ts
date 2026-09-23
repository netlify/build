/**
 * Safely extracts a message from a caught value that isn't guaranteed to be an `Error`.
 */
export const getErrorMessage = (error: unknown): string => {
  try {
    return error instanceof Error ? error.message : (error?.toString() ?? 'unknown error')
  } catch {
    return 'unknown error'
  }
}

type asyncFunction<T, Args extends unknown[]> = (...args: Args) => Promise<T>
/**
 * Wrap an async function so it prepends an error message on exceptions.
 * This helps locate errors.
 */
export const addAsyncErrorMessage = function <T, Args extends unknown[] = unknown[]>(
  asyncFunc: asyncFunction<T, Args>,
  message: string,
): asyncFunction<T, Args> {
  return async (...args) => {
    try {
      return await asyncFunc(...args)
    } catch (error) {
      // The wrapped socket and JSON calls throw Errors
      const errorA = error as Error
      errorA.stack = `${message}: ${String(errorA.stack)}`
      throw error
    }
  }
}
