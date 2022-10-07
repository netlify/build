// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import { RetryUtilsOptions } from "../options.ts";
import { retry, retryAsync } from "../../retry.ts";

const until = <RETURN_TYPE>(
  lastResult: RETURN_TYPE | undefined | null,
): boolean => lastResult !== undefined && lastResult !== null;

export async function retryUntilDefined<RETURN_TYPE>(
  fn: () => RETURN_TYPE | undefined | null,
  retryOptions?: RetryUtilsOptions,
): Promise<RETURN_TYPE> {
  const result = await retry(fn, { ...retryOptions, until });
  return result!;
}

export async function retryAsyncUntilDefined<RETURN_TYPE>(
  fn: () => Promise<RETURN_TYPE | undefined | null>,
  options?: RetryUtilsOptions,
): Promise<RETURN_TYPE> {
  const result = await retryAsync(fn, { ...options, until });
  return result!;
}
