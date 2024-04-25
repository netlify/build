import { UNTIL } from "../options.ts";
import { retry, retryAsync } from "../retry.ts";
import { RetryUtilsOptions } from "./options.ts";

export const retryHof = <RETURN_TYPE>(until: UNTIL<RETURN_TYPE>) =>
  (
    fn: () => RETURN_TYPE,
    retryOptions?: RetryUtilsOptions,
  ): Promise<RETURN_TYPE> => retry(fn, { ...retryOptions, until });

export const retryAsyncHof = <RETURN_TYPE>(until: UNTIL<RETURN_TYPE>) =>
  (
    fn: () => Promise<RETURN_TYPE>,
    retryOptions?: RetryUtilsOptions,
  ): Promise<RETURN_TYPE> => retryAsync(fn, { ...retryOptions, until });
