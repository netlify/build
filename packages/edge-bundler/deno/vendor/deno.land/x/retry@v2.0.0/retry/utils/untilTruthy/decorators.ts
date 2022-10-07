// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import { RetryUtilsOptions } from "../options.ts";
import { retryAsyncUntilTruthy, retryUntilTruthy } from "./retry.ts";

export function retryUntilTruthyDecorator<
  // deno-lint-ignore no-explicit-any
  PARAMETERS_TYPE extends any[],
  RETURN_TYPE,
>(
  fn: (...args: PARAMETERS_TYPE) => RETURN_TYPE,
  retryOptions?: RetryUtilsOptions,
): (...args: PARAMETERS_TYPE) => Promise<RETURN_TYPE> {
  return (...args: PARAMETERS_TYPE): Promise<RETURN_TYPE> => {
    const wrappedFn = () => fn(...args);
    return retryUntilTruthy(wrappedFn, retryOptions);
  };
}

export function retryAsyncUntilTruthyDecorator<
  // deno-lint-ignore no-explicit-any
  PARAMETERS_TYPE extends any[],
  RETURN_TYPE,
>(
  fn: (...args: PARAMETERS_TYPE) => Promise<RETURN_TYPE>,
  retryOptions?: RetryUtilsOptions,
): (...args: PARAMETERS_TYPE) => Promise<RETURN_TYPE> {
  return (...args: PARAMETERS_TYPE): Promise<RETURN_TYPE> => {
    const wrappedFn = () => fn(...args);
    return retryAsyncUntilTruthy(wrappedFn, retryOptions);
  };
}
