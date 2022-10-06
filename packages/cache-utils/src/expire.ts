const SECS_TO_MSECS = 1e3

/**
 * Calculate the expiration date based on a time to leave in seconds
 * This might be used to retrieve the expiration date when caching a file
 */
export const getExpires = (timeToLeave: number) => {
  if (!Number.isInteger(timeToLeave) || timeToLeave < 1) {
    return
  }

  return Date.now() + timeToLeave * SECS_TO_MSECS
}

/**
 * Check if a expiredDate in milliseconds (retrieved by `Date.now`) has already expired
 * This might be used to check if a file is expired
 */
export const checkExpires = (expiredDate: number) => expiredDate !== undefined && Date.now() > expiredDate
