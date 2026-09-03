/**
 * Safely extracts a message from a caught value that isn't guaranteed to be an `Error`.
 */
export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : (error?.toString() ?? 'unknown error')

type asyncFunction<T> = (...args: unknown[]) => Promise<T>
/**
 * Wrap an async function so it prepends an error message on exceptions.
 * This helps locate errors.
 */
export const addAsyncErrorMessage = function <T>(asyncFunc: asyncFunction<T>, message: string): asyncFunction<T> {
  return async (...args) => {
    try {
      return await asyncFunc(...args)
    } catch (error) {
      error.stack = `${message}: ${error.stack}`
      throw error
    }
  }
}
