// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import { RetryUtilsOptions } from "../options.ts";
import { retryAsyncUntilDefined, retryUntilDefined } from "./retry.ts";

export function retryUntilDefinedDecorator<
  // deno-lint-ignore no-explicit-any
  PARAMETERS_TYPE extends any[],
  RETURN_TYPE,
>(
  fn: (...args: PARAMETERS_TYPE) => RETURN_TYPE | undefined | null,
  retryOptions?: RetryUtilsOptions,
): (...args: PARAMETERS_TYPE) => Promise<RETURN_TYPE> {
  return (
    ...args: PARAMETERS_TYPE
  ): Promise<RETURN_TYPE> => {
    const wrappedFn = () => fn(...args);
    return retryUntilDefined(wrappedFn, retryOptions);
  };
}

export function retryAsyncUntilDefinedDecorator<
  // deno-lint-ignore no-explicit-any
  PARAMETERS_TYPE extends any[],
  RETURN_TYPE,
>(
  fn: (...args: PARAMETERS_TYPE) => Promise<RETURN_TYPE | undefined | null>,
  retryOptions?: RetryUtilsOptions,
): (...args: PARAMETERS_TYPE) => Promise<RETURN_TYPE> {
  return (
    ...args: PARAMETERS_TYPE
  ): Promise<RETURN_TYPE> => {
    const wrappedFn = () => fn(...args);
    return retryAsyncUntilDefined(wrappedFn, retryOptions);
  };
}
