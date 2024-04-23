// Copyright since 2020, FranckLdx. All rights reserved. MIT license.
import { denoDelay } from "../deps.ts";
import { assertDefined, asyncDecorator } from "../misc.ts";
import {
  defaultRetryOptions,
  getDefaultRetryOptions,
  RetryOptions,
} from "./options.ts";
import { isTooManyTries, TooManyTries } from "./tooManyTries.ts";

/** 
 * Retry a function until it does not throw an exception.
 *  
 * @param fn the function to execute
 * @param retryOptions retry options
 */
export function retry<RETURN_TYPE>(
  fn: () => RETURN_TYPE,
  retryOptions?: RetryOptions<RETURN_TYPE>,
): Promise<RETURN_TYPE> {
  const fnAsync = asyncDecorator(fn);
  return retryAsync(fnAsync, retryOptions);
}

/** 
 * Retry an async function until it does not throw an exception.
 *  
 * @param fn the async function to execute
 * @param retryOptions retry options
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  retryOptions?: RetryOptions<T>,
): Promise<T> {
  const { maxTry, delay, until } = {
    ...getDefaultRetryOptions(),
    ...retryOptions,
  };
  assertDefined(maxTry, `maxTry must be defined`);
  assertDefined(delay, `delay must be defined`);
  const canRecall = () => maxTry! > 1;
  const recall = async () => {
    await denoDelay(delay!);
    return await retryAsync(fn, { delay, maxTry: maxTry! - 1, until });
  };
  try {
    const result = await fn();
    const done = until ? until(result) : true;
    if (done) {
      return result;
    } else if (canRecall()) {
      return await recall();
    } else {
      throw new TooManyTries();
    }
  } catch (err) {
    if (!isTooManyTries(err) && canRecall()) {
      return await recall();
    } else {
      throw err;
    }
  }
}
