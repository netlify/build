// Copyright since 2020, FranckLdx. All rights reserved. MIT license.

/** type of the unil function */
export type UNTIL<RETURN_TYPE> = (lastResult: RETURN_TYPE) => boolean;

/** 
 * Retry options:
 *  - maxTry: maximum number of attempts. if fn is still throwing execption afect maxtry attempts, an exepction is thrown 
 *  - delay: number of miliseconds between each attempt.
 *  - until: if given, the function will be call until this function returns tru or until maxTry calls. 
 */
export interface RetryOptions<RETURN_TYPE> {
  maxTry?: number;
  delay?: number;
  until?: UNTIL<RETURN_TYPE> | null;
}

// deno-lint-ignore no-explicit-any
export let defaultRetryOptions: RetryOptions<any> = {
  delay: 250,
  maxTry: 4 * 60,
  until: null,
};

/** Set default retry options */
export function setDefaultRetryOptions<T>(
  retryOptions: Partial<RetryOptions<T>>,
): RetryOptions<T> {
  defaultRetryOptions = { ...defaultRetryOptions, ...retryOptions };
  return getDefaultRetryOptions();
}

/** Returns the current retry options. To change default options, use setDefaultRetryOptions: do not try to modify this object */
export function getDefaultRetryOptions<T>(): Readonly<RetryOptions<T>> {
  return { ...defaultRetryOptions };
}
