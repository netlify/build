// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import { retry, retryAsync } from "./retry.ts";
import { RetryOptions } from "./options.ts";

export function retryAsyncDecorator<
  // deno-lint-ignore no-explicit-any
  RETURN_TYPE extends (...args: any[]) => Promise<any>,
>(
  fn: RETURN_TYPE,
  retryOptions?: RetryOptions<RETURN_TYPE>,
) {
  return (...args: Parameters<RETURN_TYPE>): ReturnType<RETURN_TYPE> => {
    const wrappedFn = () => fn(...args);
    return retryAsync(wrappedFn, retryOptions) as ReturnType<RETURN_TYPE>;
  };
}

export function retryDecorator<
  // deno-lint-ignore no-explicit-any
  RETURN_TYPE extends (...args: any[]) => any,
>(
  fn: RETURN_TYPE,
  retryOptions?: RetryOptions<RETURN_TYPE>,
) {
  return (
    ...args: Parameters<RETURN_TYPE>
  ): Promise<ReturnType<RETURN_TYPE>> => {
    const wrappedFn = () => fn(...args);
    return retry(wrappedFn, retryOptions) as Promise<ReturnType<RETURN_TYPE>>;
  };
}
