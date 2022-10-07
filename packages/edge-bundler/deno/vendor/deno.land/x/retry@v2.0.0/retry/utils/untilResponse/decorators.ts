// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import {retryAsyncUntilResponse} from './retry.ts'
import { RetryUtilsOptions } from "../options.ts";

export function retryAsyncUntilResponseDecorator<
  // deno-lint-ignore no-explicit-any
  PARAMETERS_TYPE extends any[],
  RETURN_TYPE extends Response,
>(
  fn: (...args: PARAMETERS_TYPE) => Promise<RETURN_TYPE>,
  retryOptions?: RetryUtilsOptions,
)  {
  return (...args: PARAMETERS_TYPE): Promise<RETURN_TYPE> => {
    const wrappedFn = () => fn(...args);
    return retryAsyncUntilResponse(wrappedFn, retryOptions);
  }
}

