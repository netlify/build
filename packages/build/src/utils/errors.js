// Wrap an async function so it prepends an error message on exceptions.
// This helps locate errors.
export const addAsyncErrorMessage = function (asyncFunc, message) {
  return async (...args) => {
    try {
      return await asyncFunc(...args)
    } catch (error) {
      error.stack = `${message}: ${error.stack}`
      throw error
    }
  }
}
