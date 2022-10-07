// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import { RetryUtilsOptions } from "../options.ts";
import { retry, retryAsync } from "../../retry.ts";

const until = <RETURN_TYPE>(lastResult: RETURN_TYPE): boolean =>
  // deno-lint-ignore no-explicit-any
  (lastResult as any) == true;

export function retryUntilTruthy<
  // deno-lint-ignore no-explicit-any
  PARAMETERS_TYPE extends any[],
  RETURN_TYPE,
>(
  fn: (...args: PARAMETERS_TYPE) => RETURN_TYPE,
  retryOptions?: RetryUtilsOptions,
): Promise<RETURN_TYPE> {
  return retry(fn, { ...retryOptions, until });
}

export function retryAsyncUntilTruthy<
  // deno-lint-ignore no-explicit-any
  PARAMETERS_TYPE extends any[],
  RETURN_TYPE,
>(
  fn: (...args: PARAMETERS_TYPE) => Promise<RETURN_TYPE>,
  retryOptions?: RetryUtilsOptions,
): Promise<RETURN_TYPE> {
  return retryAsync(fn, { ...retryOptions, until });
}
