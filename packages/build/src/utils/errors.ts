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
