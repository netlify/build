// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import { waitUntil, waitUntilAsync } from "./wait.ts";

/** a waitUntilAsync decorator 
 * @param fn the async function to execute
 * @param duration timeout in milliseconds
 * @param [error] custom error to throw when fn duration exceeded duration. If not provided a TimeoutError is thrown.
 * @returns a function hat takes same parameters as fn. It calls fn using waitUntilAsync and returns/throws the results/error of this call? 
*/
export function waitUntilAsyncDecorator<
  // deno-lint-ignore no-explicit-any
  RETURN_TYPE extends (...args: any[]) => Promise<any>,
>(fn: RETURN_TYPE, duration?: number, error?: Error) {
  return (...args: Parameters<RETURN_TYPE>): ReturnType<RETURN_TYPE> => {
    const wrappedFn = () => fn(...args);
    return waitUntilAsync(wrappedFn, duration, error) as ReturnType<
      RETURN_TYPE
    >;
  };
}

/** a waitUntil decorator 
 * @param fn the function to execute
 * @param duration timeout in milliseconds
 * @param [error] custom error to throw when fn duration exceeded duration. If not provided a TimeoutError is thrown.
 * @returns: a function hat takes same parameters as fn. It calls fn using waitUntil and returns/throws the results/error of this call? 
*/
export function waitUntilDecorator<
  // deno-lint-ignore no-explicit-any
  T extends (...args: any[]) => any,
>(fn: T, duration?: number, error?: Error) {
  return (...args: Parameters<T>): ReturnType<T> => {
    const wrappedFn = () => fn(...args);
    return waitUntil(wrappedFn, duration, error) as ReturnType<T>;
  };
}
